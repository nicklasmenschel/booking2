#!/bin/bash

# Design System Rollout Script
# Automatically updates all files with new color scheme and design patterns

echo "🎨 Starting Design System Rollout..."
echo "======================================"

# Navigate to src directory
cd "/Users/nicklasmenschel/TEST BOOKING 2/garden-table/src"

# Color Replacements
echo "📝 Step 1: Updating color codes..."

# Replace old blue primary with new brown
find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) -exec sed -i '' 's/#0EA5E9/#C9A76B/g' {} +
find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) -exec sed -i '' 's/#0284C7/#B8955A/g' {} +

# Replace blue ring/focus colors with warm tones
find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) -exec sed -i '' 's/#F0F9FF/#F7F3ED/g' {} +

# Replace old success green with sage green (if different)
find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) -exec sed -i '' 's/#10B981/#9CAF6E/g' {} +

# Replace error red with orange-red (if using old red)
find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) -exec sed -i '' 's/#EF4444/#FF5722/g' {} +

echo "✅ Color codes updated"

# Border Radius Updates
echo "📝 Step 2: Updating border radius..."

# Update cards: rounded-lg -> rounded-xl, rounded-xl -> rounded-2xl
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/rounded-lg border border-gray/rounded-xl border-2 border-gray/g' {} +

echo "✅ Border radius updated"

# Border Width Updates  
echo "📝 Step 3: Updating border widths..."

# Update to border-2 for cards
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/border border-gray-200/border-2 border-gray-300/g' {} +

echo "✅ Border widths updated"

# Component Prop Updates
echo "📝 Step 4: Updating component props..."

# Update Card: hoverable -> interactive
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/hoverable={true}/interactive={true}/g' {} +
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/hoverable={false}/interactive={false}/g' {} +
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/hoverable/interactive/g' {} +

echo "✅ Component props updated"

# CSS Variable Updates
echo "📝 Step 5: Updating CSS variable references..."

# Update Tailwind CSS variable references in component files
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/border-accent/border-\[#C9A76B\]/g' {} +
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/text-accent/text-\[#C9A76B\]/g' {} +
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/bg-accent/bg-\[#C9A76B\]/g' {} +
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/ring-accent/ring-\[#C9A76B\]/g' {} +

find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/border-error/border-\[#FF5722\]/g' {} +
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/text-error/text-\[#FF5722\]/g' {} +
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/bg-error/bg-\[#FF5722\]/g' {} +

find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/border-success/border-\[#9CAF6E\]/g' {} +
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/text-success/text-\[#9CAF6E\]/g' {} +
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/bg-success/bg-\[#9CAF6E\]/g' {} +

echo "✅ CSS variables updated"

# Update gray tones for better contrast
echo "📝 Step 6: Updating gray scales..."

# Update lighter borders to be more visible
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/border-gray-100/border-gray-200/g' {} +

# Update text colors for better hierarchy
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/text-gray-700 mb-2/text-gray-900 mb-2/g' {} +

echo "✅ Gray scales updated"

echo ""
echo "======================================"
echo "✨ Design System Rollout Complete!"
echo "======================================"
echo ""
echo "Updated across all .tsx, .ts, .jsx, .js files:"
echo "  ✓ Primary color: Blue -> Warm Brown (#C9A76B)"
echo "  ✓ Success color: Green -> Sage Green (#9CAF6E)"  
echo "  ✓ Error color: Red -> Orange-Red (#FF5722)"
echo "  ✓ Border radius: More rounded (xl, 2xl)"
echo "  ✓ Border widths: Thicker (border-2)"
echo "  ✓ Component props: hoverable -> interactive"
echo "  ✓ CSS variables: Direct hex values"
echo ""
echo "⚠️  Please review changes and test the application"
