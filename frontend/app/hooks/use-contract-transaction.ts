import { useEffect, useState, useCallback, useRef } from "react";
import {
    useAccount,
    useWriteContract,
    useWaitForTransactionReceipt,
    useReadContract,
} from "wagmi";
import { CONTRACTS } from "@/config/contracts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Generic transaction step lifecycle shared by all admin modules. */
export type TxStep = "idle" | "approving" | "executing" | "success";

export interface UseContractTransactionConfig {
    /** Address of the contract that will spend USDC (approval target). */
    spenderAddress: `0x${string}`;
    /** The amount to approve. Must be reactive (can change between renders). */
    approvalAmount: bigint;
    /** Extra refetch callbacks invoked after any transaction settles. */
    additionalRefetches?: Array<() => void>;
    /** Callback invoked when a transaction reaches the "success" state. */
    onSuccess?: () => void;
}

export interface UseContractTransactionReturn {
    // ---- State ----
    step: TxStep;
    txHash: `0x${string}` | undefined;
    isProcessing: boolean;
    isWaitingForTx: boolean;

    // ---- Derived ----
    needsApprove: boolean;
    insufficientBalance: boolean;
    allowance: bigint | undefined;
    usdcBalance: bigint | undefined;

    // ---- Actions ----
    /** Approve the spender for `approvalAmount` of MockUSDC. */
    handleApprove: () => Promise<void>;
    /**
     * Execute an arbitrary contract write.
     * Pass a callback that calls `writeContractAsync` and returns the tx hash.
     */
    executeAction: (
        writeFn: () => Promise<`0x${string}`>,
    ) => Promise<void>;
    /** Reset step & txHash back to idle. */
    reset: () => void;
}

// ---------------------------------------------------------------------------
// Hook Implementation
// ---------------------------------------------------------------------------

export function useContractTransaction({
    spenderAddress,
    approvalAmount,
    additionalRefetches = [],
    onSuccess,
}: UseContractTransactionConfig): UseContractTransactionReturn {
    const { address } = useAccount();

    // ---- Core state ----
    const [step, setStep] = useState<TxStep>("idle");
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

    // Keep a stable ref for additionalRefetches to avoid effect re-runs
    const refetchesRef = useRef(additionalRefetches);
    refetchesRef.current = additionalRefetches;

    const onSuccessRef = useRef(onSuccess);
    onSuccessRef.current = onSuccess;

    // ---- USDC reads ----
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: CONTRACTS.MockUSDC.address as `0x${string}`,
        abi: CONTRACTS.MockUSDC.abi,
        functionName: "allowance",
        args: address
            ? [address, spenderAddress]
            : undefined,
    });

    const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
        address: CONTRACTS.MockUSDC.address as `0x${string}`,
        abi: CONTRACTS.MockUSDC.abi,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
    });

    // ---- Tx receipt ----
    const { writeContractAsync: approveWrite } = useWriteContract();

    const { isLoading: isWaitingForTx } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    // ---- Refetch after tx settles ----
    useEffect(() => {
        if (!isWaitingForTx && txHash) {
            refetchAllowance();
            refetchBalance();
            refetchesRef.current.forEach((fn) => fn());

            if (step === "approving") {
                setStep("idle");
                setTxHash(undefined);
            } else if (step === "executing") {
                setStep("success");
                setTxHash(undefined);
                onSuccessRef.current?.();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isWaitingForTx, txHash]);

    // ---- Actions ----
    const handleApprove = useCallback(async () => {
        try {
            setStep("approving");
            const hash = await approveWrite({
                address: CONTRACTS.MockUSDC.address as `0x${string}`,
                abi: CONTRACTS.MockUSDC.abi,
                functionName: "approve",
                args: [spenderAddress, approvalAmount],
            });
            setTxHash(hash);
        } catch (error) {
            console.error("Approve error:", error);
            setStep("idle");
        }
    }, [approveWrite, spenderAddress, approvalAmount]);

    const executeAction = useCallback(
        async (writeFn: () => Promise<`0x${string}`>) => {
            try {
                setStep("executing");
                const hash = await writeFn();
                setTxHash(hash);
            } catch (error) {
                console.error("Transaction error:", error);
                setStep("idle");
            }
        },
        [],
    );

    const reset = useCallback(() => {
        setStep("idle");
        setTxHash(undefined);
    }, []);

    // ---- Derived state ----
    const isProcessing = step !== "idle" && step !== "success";

    const needsApprove =
        approvalAmount > BigInt(0) &&
        (allowance === undefined || (allowance as bigint) < approvalAmount);

    const insufficientBalance =
        approvalAmount > BigInt(0) &&
        usdcBalance !== undefined &&
        (usdcBalance as bigint) < approvalAmount;

    return {
        step,
        txHash,
        isProcessing,
        isWaitingForTx,
        needsApprove,
        insufficientBalance,
        allowance: allowance as bigint | undefined,
        usdcBalance: usdcBalance as bigint | undefined,
        handleApprove,
        executeAction,
        reset,
    };
}
