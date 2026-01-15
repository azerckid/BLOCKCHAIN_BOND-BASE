import { auth } from "../lib/auth";
import { type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";

export const action = async ({ request }: ActionFunctionArgs) => {
    return auth.handler(request);
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
    return auth.handler(request);
};
