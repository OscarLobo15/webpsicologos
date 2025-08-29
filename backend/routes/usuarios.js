const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");
const jwt = require("jsonwebtoken");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// === Registro ===
router.post("/register", async (req, res) => {
  const { email, password, tipo_usuario, nombre, apellido } = req.body;

  if (!["paciente", "psicologo"].includes(tipo_usuario)) {
    return res.status(400).json({ error: "Tipo de usuario no válido" });
  }

  const { data: user, error } = await supabase
    .from("usuarios")
    .insert([{ email, password, tipo_usuario }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: "Error al registrar usuario" });

  if (tipo_usuario === "psicologo") {
    await supabase.from("perfiles_psicologos").insert({
      usuario_id: user.id,
      nombre,
      apellido,
    });
  } else {
    await supabase.from("perfiles_clientes").insert({
      usuario_id: user.id,
      nombre,
      apellido,
    });
  }

  res.json({ success: true, user });
});

module.exports = router;
