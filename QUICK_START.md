# ⚡ QUICK START - Новите Features

## 🎨 Feature 1: HTML Visualizer (Cart Scripts)

**Къде:** Step 3, бутон "🎨 HTML Visualizer"

**Как:**
```
1. Generate Cart script
2. Click "🎨 HTML Visualizer"
3. Paste raw HTML (left panel)
4. Click "🎨 Visualize" (right panel)
5. See rendered HTML! ✅
```

**Пример:**
```html
Input (left):  <div class="cart-item">iPhone 15 - $999</div>
Output (right): [Rendered as actual HTML with styling]
```

---

## ⚙️ Feature 2: Payment Methods Config

**Къде:** Step 2, бутон "⚙️ Configure Payment Methods" (само за Payment type)

**Как:**
```
1. Select "Payment Methods" type
2. Analyze → Select candidate
3. Click "⚙️ Configure Payment Methods"
4. CHECK методите които искаш да СКРИЕШ
5. Click "✅ Apply"
6. Generate Script
```

**Example:**
```
✅ COD         (hide)
✅ PayPal      (hide)
⬜ Card        (show) ← Leave unchecked
✅ Bank Transfer (hide)
```

Result: Script скрива COD, PayPal, Bank Transfer. Оставя само Card!

---

## 🤖 Feature 3: AI Assistant (Fixed)

**Къде:** Header, бутон "🤖 AI Assistant"

**Промяната:**
- ❌ Преди: iframe (блокиран от CORS)
- ✅ Сега: отваря в нов прозорец

**Как:**
```
1. Click "🤖 AI Assistant"
2. New window opens with DeepSeek
3. Scripts auto-copied to clipboard
4. Paste in chat
5. Ask questions!
```

**If pop-up blocked:**
- Allow pop-ups in browser
- Try again

---

## 🎯 Тествай Сега!

### Test 1: HTML Visualizer
```
1. Open payment-script-generator-pro.html
2. Step 1: Select "Cart Items"
3. Step 2: Use any diagnostic (or skip)
4. Step 3: Click "🎨 HTML Visualizer"
5. Paste any HTML
6. Click "🎨 Visualize"
```

### Test 2: Payment Config
```
1. Step 1: Select "Payment Methods"
2. Step 2: Analyze → Select candidate
3. Look for "⚙️ Configure" button
4. Click it
5. Check/uncheck methods
6. Apply
```

### Test 3: AI Assistant
```
1. Click "🤖 AI Assistant" (header)
2. New window should open
3. Check clipboard (should have scripts)
4. Paste in DeepSeek
```

---

## ✅ Всичко работи!

**Need help?** → Check `README_NEW_FEATURES.md` за full details!
