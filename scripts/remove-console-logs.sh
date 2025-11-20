#!/bin/bash

# Simple script: Just delete console.log lines entirely
# Keeps console.error and console.warn

echo "🧹 Removing console.log statements..."
echo ""

find src/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | while read file; do
  if grep -q "console\.log" "$file"; then
    echo "Processing: $file"

    # Delete lines containing console.log (but not console.error or console.warn)
    # Use perl for better regex support
    perl -i -ne 'print unless /^\s*console\.log\(/' "$file"

    echo "  ✓ Removed console.log lines"
  fi
done

echo ""
echo "✅ Done!"
echo ""
echo "To verify: git diff src/"
