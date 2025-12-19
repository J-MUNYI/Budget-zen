# Syncing Changes Between Cursor and VS Code

Since both Cursor and VS Code work on the same filesystem, changes are automatically saved to disk and should be visible in both editors.

## Quick Tips

### 1. Automatic Sync
- ✅ Changes are **automatically saved** to disk
- ✅ Both editors read from the **same files**
- ✅ No manual sync needed

### 2. If VS Code Doesn't Show Changes

**Option A: Reload Window**
- Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
- Type "Reload Window" and press Enter

**Option B: Close and Reopen File**
- Close the file tab in VS Code
- Reopen it from the file explorer

**Option C: Restart VS Code**
- Close VS Code completely
- Reopen it

### 3. Verify Changes Are Saved

Check in terminal:
```bash
git status
```

Or check file modification time:
```bash
ls -la client/src/pages/Register.jsx
```

### 4. Best Practices

- **Save files** before switching editors (Ctrl+S / Cmd+S)
- **Close files** you're not actively editing
- **Use one editor at a time** for the same file to avoid conflicts
- **Check for unsaved changes** (dotted circle on file tab) before switching

### 5. File Watching Issues

If VS Code isn't detecting changes automatically:

1. Check VS Code settings:
   - File → Preferences → Settings
   - Search for "files.watcherExclude"
   - Make sure your project files aren't excluded

2. Increase file watcher limits (Linux):
   ```bash
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

### 6. Git Integration

Both editors can use Git:
- Changes are tracked by Git, not the editor
- Use `git status` to see all changes
- Commit from either editor

## Troubleshooting

**Problem**: VS Code shows old content
**Solution**: Reload the window or restart VS Code

**Problem**: Changes not appearing
**Solution**: 
1. Check if file was actually saved (look for unsaved indicator)
2. Verify you're looking at the correct file
3. Check if file is excluded in VS Code settings

**Problem**: Conflicts between editors
**Solution**: 
- Don't edit the same file simultaneously in both editors
- Save and close files before switching editors
- Use Git to track and merge changes if needed

## Summary

✅ **Changes are automatic** - both editors read from the same filesystem
✅ **No sync needed** - just save your files (Ctrl+S)
✅ **Reload VS Code** if changes don't appear immediately
✅ **Use Git** to track all changes regardless of editor
