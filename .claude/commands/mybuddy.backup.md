---
description: Back up content and config to the data repo.
---

## Procedure

### 1. Run Backup

Run the backup script:

```bash
bun data:backup
```

### 2. Report Result

If the script succeeds, show the output and confirm what was backed up.

If it fails (e.g., data repo not found), show the error message — it includes setup instructions.

### 3. Remind About Pushing

After a successful backup, remind the user:

```
To push: cd ../my-buddy-data && git add -A && git commit -m "backup" && git push
```
