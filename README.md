# 🎄 Calendari d'Advent 2026

Un calendari d'advent interactiu per compartir amb la familia i amics. Completament customizable, fet amb  **Next.js** i **Supabase**.

---

## 🚀 Començament

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Copy `.env.example` to `.env.local` and add your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```

3. **Run the local development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎮 Minijocs inclosos al calendari de 2026

- 📜 Endevinalla 
- 🔍 Sopa de lletres 
- ❓ Pregunta familiar
- 👶 Endevina el nadó 
- 🃏 Joc de memòria 
- 🟩 Wordle de Nadal
- ☃️ El ninot de neu 
- 🔤 Lletres desordenades 
- 🔢 Equació nadalenca 
- 🔮 Barreja de boles 
- 🎁 Atrapa els regals 
- 💩 On és el Caganer? 
- 🔔 Campanes de Nadal 
- 🪵 Pica el Tió 
- 🧩 Mini Sudoku nadalenc 

---

## 🧭 ON ANAR?

- **Pàgina del Calendari (Jugadors):**  
  `http://localhost:3000/app/[calendar_slug]`  
  Obra les 24 portes del calendari, juga els minijocs diaris i revela el secret que amaga el puzzle final.

- **Panell d'Admin:**  
  `http://localhost:3000/admin`  
  Per crear i administrar els calendaris, configura els 24 dies amb els jocs que vulguis per cada dia.

> **🔑 Accés Admin:**  
> Per entrar al panell de `/admin`, primer has de crear l'usuari de l'administrador dins del **Supabase project**:  
> Ves a **Supabase Dashboard > Authentication > Users > Add user** (enter an email and password).Utilitza aquestes credencials per entrar a `/admin`.
