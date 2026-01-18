---
name: knowledge-sync-agent
description: Synchronizes project documentation and codebase changes with the AI knowledge base.
---

# Knowledge Sync Agent Skill

This skill ensures that the documentation (`docs/`) and the AI's internal knowledge base (`frontend/app/lib/knowledge.json`) remain consistent with the actual codebase.

## 1. Sync Trigger Workflow

Use this skill whenever:
1.  **Documentation is Updated**: User edits a `.md` file in `docs/`.
2.  **Contracts are Deployed**: New contract addresses are generated.
3.  **API/Logic Changes**: New features are added to the frontend.

## 2. Execution Steps

### Step 1: Verify Knowledge Generation Script
- Ensure `frontend/scripts/generate-knowledge.cjs` exists.
- Check if it targets the correct input directory (`../../docs`) and output file (`frontend/app/lib/knowledge.json`).

### Step 2: Run Sync Command
Execute the generation script to rebuild the JSON knowledge base.
```bash
cd frontend && node scripts/generate-knowledge.cjs
```

### Step 3: Consistency Audit
- **Address Check**: Scan `frontend/app/config/contracts.ts` and ensure `docs/guides/user_app_guide.md` (or relevant docs) reflects the correct contract names/addresses if mentioned.
- **Terminology Check**: Ensure terms like "BondToken", "OracleAdapter" are used consistently across `docs/`.

## 3. Auto-Reflection Strategy

If you notice a discrepancy between code and docs:
1.  **Propose Update**: "The `YieldDistributor` logic changed. Should I update `docs/guides/yield_system_guide.md`?"
2.  **Edit Doc**: Use `replace_file_content` to update the markdown.
3.  **Re-Sync**: Run the sync command again.

## 4. Usage Commands
- **Sync Now**: "Update the knowledge base"
- **Check Docs**: "Are the docs up to date with the latest deployment?"
