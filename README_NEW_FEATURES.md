# 🎉 Payment Script Generator Pro - NEW FEATURES!

## ✅ ВСИЧКИ 3 ПРОБЛЕМА СА ФИКСИРАНИ!

---

## 🎨 **FEATURE 1: HTML Visualizer за Cart Scripts**

### Какво прави:
След генериране на Cart script, имаш **2 бутона** в Step 3:
- **🎨 HTML Visualizer** - НОВ!
- **👀 Preview Raw HTML** - Старият бутон

### Как работи HTML Visualizer:

1. **Генерирай Cart script** в Step 3
2. Кликни **🎨 HTML Visualizer**
3. Отваря се **голям modal** с 2 панела:

#### **Ляв Панел: 📝 Raw HTML Input**
- Textarea за paste на сурови HTML
- Бутони:
  - **📋 Paste** - автоматично paste от clipboard
  - **🗑️ Clear** - изчиства input-а

#### **Десен Панел: 👁️ Visual Preview**
- Тук виждаш HTML-а **рендериран** (като в браузър)
- Бутон:
  - **🎨 Visualize** - рендерира HTML-а

#### **Workflow:**
```
1. Run getItems() script в браузър конзола
2. Copy HTML output
3. Click "🎨 HTML Visualizer" в Generator-а
4. Click "📋 Paste" (или Ctrl+V)
5. Click "🎨 Visualize"
6. Виждаш рендерирана количка! ✅
```

#### **Stats:**
В долу вдясно виждаш статистики:
```
1234 chars | 45 lines | 3 images | 5 links | 2 prices | ~3 products
```

---

## ⚙️ **FEATURE 2: Payment Methods Configuration**

### Какво прави:
При **Payment Methods** script type, сега можеш да **избереш** кои методи да се махнат!

### Как работи:

1. **Step 1:** Избери "Payment Methods"
2. **Step 2:** Analyze result → виждаш кандидатите
3. **Нов бутон се появява:** **⚙️ Configure Payment Methods**
4. Кликни го → отваря се **modal** с всички методи

#### **Payment Methods Modal:**
- **Checkboxes** за всеки payment method
- **Check методите** които искаш да **СКРИЕШ**
- Виждаш колко си избрал: "✅ Selected to hide: 3 methods"

#### **Често срещани методи:**
- ✅ Cash on Delivery (COD)
- ✅ Bank Transfer
- ✅ PayPal
- ⬜ Credit/Debit Card (leave visible)
- ✅ Apple Pay
- ✅ Google Pay
- ⬜ Stripe (leave visible)
- ⬜ myPOS (leave visible)
- ✅ ePay
- ✅ Paysera

#### **Workflow:**
```
1. Step 1: Select "Payment Methods"
2. Step 2: Analyze → Select candidate
3. Click "⚙️ Configure Payment Methods"
4. Check методите които искаш да скриеш
5. Click "✅ Apply Selection"
6. Click "Generate Script"
7. Скриптът ще скрие само избраните методи! ✅
```

---

## 🤖 **FEATURE 3: DeepSeek AI - Fixed!**

### Проблемът:
DeepSeek **блокираше iframe** заради CORS policy.

### Решението:
Сега **отваря в нов прозорец** вместо iframe!

### Как работи:

1. Кликни **🤖 AI Assistant** бутона (горе вдясно)
2. Отваря се **нов прозорец** с DeepSeek
3. Автоматично **копира скриптовете** в clipboard
4. **Paste** в DeepSeek чата
5. Питай AI:
   - "Explain how this script works"
   - "What's the best variant for my site?"
   - "How can I improve this?"
   - "Debug this error: ..."

#### **Ако Pop-up е блокиран:**
- Браузърът показва икона в адрес бара
- Кликни я → "Allow pop-ups for this site"
- Опитай пак

---

## 📋 **Пълен Workflow за Cart Script:**

```
1. Step 1: Select "Cart Items"
   ↓
2. Step 2: Paste diagnostic JSON → Analyze
   ↓
3. Select best candidate
   ↓
4. Click "Generate Script"
   ↓
5. Step 3: View 3 script variants
   ↓
6. Click "🎨 HTML Visualizer"
   ↓
7. Paste raw HTML → Visualize
   ↓
8. See rendered cart! ✅
   ↓
9. Need help? Click "🤖 AI Assistant"
```

---

## 📋 **Пълен Workflow за Payment Methods:**

```
1. Step 1: Select "Payment Methods"
   ↓
2. Step 2: Paste diagnostic JSON → Analyze
   ↓
3. Select best candidate
   ↓
4. Click "⚙️ Configure Payment Methods"
   ↓
5. Check методите които искаш да скриеш
   ↓
6. Click "✅ Apply Selection"
   ↓
7. Click "Generate Script"
   ↓
8. Step 3: Script скрива само избраните методи! ✅
```

---

## 🎯 **Бързи Съвети:**

### Cart Scripts:
- **Visualizer** > Preview - по-удобен за проверка на HTML
- Виждаш дали има снимки, цени, продукти
- Stats показват какво има в количката

### Payment Methods:
- По подразбиране, **check само методите които искаш да скриеш**
- Uncheck = stay visible
- Config се запазва докато не refresh-неш страницата

### AI Assistant:
- Отваря в **нов прозорец** (не iframe)
- **Auto-copy** скриптовете
- Просто paste в чата и питай!

---

## 🐛 **Debugging:**

Ако нещо не работи:
1. Натисни **🐛 DEBUG** бутона (горе вдясно, оранжев)
2. Провери Console (F12)
3. Виж **TROUBLESHOOTING.md** за details

---

## 📁 **Files:**

- `payment-script-generator-pro.html` - Main HTML file
- `script-generator-pro.js` - JavaScript logic
- `TROUBLESHOOTING.md` - Debug guide
- `README_NEW_FEATURES.md` - This file

---

## 🚀 **Какво е ново:**

| Feature | Status | Location |
|---------|--------|----------|
| HTML Visualizer | ✅ NEW | Step 3 (Cart only) |
| Payment Config | ✅ NEW | Step 2 (Payment only) |
| AI Assistant Fix | ✅ FIXED | Opens in new window |
| Debug Button | ✅ NEW | Header (orange) |

---

## 💡 **Pro Tips:**

1. **HTML Visualizer:**
   - Copy HTML от console
   - Click "📋 Paste" (по-бързо от Ctrl+V)
   - Check Stats за да видиш какво има

2. **Payment Methods:**
   - Recommended candidate обикновено е най-добър
   - Check ALL методи които искаш да скриеш
   - Apply → Generate → Done!

3. **AI Assistant:**
   - Allow pop-ups first time
   - Paste всички 3 variants
   - Питай specific въпроси

---

## ✨ **Enjoy the new features!** 🎉

Ако имаш въпроси или проблеми:
1. Check TROUBLESHOOTING.md
2. Press 🐛 DEBUG button
3. Send me the info!

**Happy coding! 💪**
