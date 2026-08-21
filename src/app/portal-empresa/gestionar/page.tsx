"use client";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = 'force-dynamic';
import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { Building2, Loader2, ArrowLeft, Shield } from "lucide-react";
import { supabase } from "../../lib/supabase";

const TEMPLATES_EMAIL: Record<string, Record<string, { asunto: string; html: (p: any) => string }>> = {
  fijo: {
    es: {
      asunto: "Bienvenido(a) a Haas Academia de Idiomas! Tu beneficio corporativo",
      html: (p) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f6; padding:40px 16px; font-family: Arial, Helvetica, sans-serif;"><tr><td align="center"><table role="presentation" width="580" cellpadding="0" cellspacing="0" style="max-width:580px; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 8px 32px rgba(11,21,40,0.12);"><tr><td style="background:linear-gradient(135deg,#0b1528,#0f2647); padding:40px 32px 32px 32px; text-align:center;"><img src="https://jdppxfokfhqjudwfwckd.supabase.co/storage/v1/object/public/haas-academy/assignments/Melhorar%20Logo%20(3).png" alt="Haas Academy" style="height:36px; margin-bottom:20px;" /><div style="font-size:38px; line-height:1; margin-bottom:12px;">🏢</div><h1 style="color:#ffffff; font-size:22px; margin:0; font-weight:800;">¡Bienvenido(a) a Haas Academia!</h1><p style="color:#9fb3d1; font-size:13px; margin:10px 0 0 0;">Tu beneficio corporativo ya está activo</p></td></tr><tr><td style="padding:36px 32px 8px 32px;"><p style="color:#0b1528; font-size:16px; line-height:1.6; margin:0 0 8px 0; font-weight:700;">¡Hola!</p><p style="color:#5a6478; font-size:14px; line-height:1.7; margin:0;">Nos alegra comunicarte que <strong>${p.empresa}</strong> activó para ti un plan corporativo exclusivo de aprendizaje de idiomas, con práctica real desde el primer día.</p></td></tr><tr><td style="padding:20px 32px 8px 32px;"><div style="background:#f5f8fc; border-radius:12px; padding:18px 20px;"><div style="color:#6d28d9; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Tus días y horarios</div><div style="color:#0b1528; font-size:14px; line-height:1.6;">Días: <strong>${p.dias}</strong><br/>Horario: <strong>${p.horario}</strong></div></div></td></tr><tr><td style="padding:20px 32px 8px 32px;"><div style="color:#0b1528; font-size:13px; font-weight:800; margin-bottom:10px;">Cómo activar tu acceso</div><div style="display:flex; align-items:flex-start; margin-bottom:8px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:24px; height:24px; background:#8b5cf6; border-radius:50%; text-align:center; vertical-align:middle; color:#fff; font-size:12px; font-weight:800;">1</td><td style="padding-left:10px; color:#5a6478; font-size:13px; line-height:1.5;">Haz clic en el botón de abajo para tu prueba de nivelación</td></tr></table></div><div style="display:flex; align-items:flex-start; margin-bottom:8px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:24px; height:24px; background:#8b5cf6; border-radius:50%; text-align:center; vertical-align:middle; color:#fff; font-size:12px; font-weight:800;">2</td><td style="padding-left:10px; color:#5a6478; font-size:13px; line-height:1.5;">Ingresa este mismo correo</td></tr></table></div><div style="display:flex; align-items:flex-start; margin-bottom:8px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:24px; height:24px; background:#8b5cf6; border-radius:50%; text-align:center; vertical-align:middle; color:#fff; font-size:12px; font-weight:800;">3</td><td style="padding-left:10px; color:#5a6478; font-size:13px; line-height:1.5;">Crea tu contraseña</td></tr></table></div><div style="display:flex; align-items:flex-start; margin-bottom:8px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:24px; height:24px; background:#8b5cf6; border-radius:50%; text-align:center; vertical-align:middle; color:#fff; font-size:12px; font-weight:800;">4</td><td style="padding-left:10px; color:#5a6478; font-size:13px; line-height:1.5;">Empieza a jugar y aprender</td></tr></table></div></td></tr><tr><td style="padding:8px 32px 40px 32px; text-align:center;"><a href="${p.link}" style="background:linear-gradient(135deg,#8b5cf6,#6d28d9); color:#fff; padding:16px 40px; border-radius:10px; text-decoration:none; font-weight:800; font-size:15px; display:inline-block; box-shadow:0 4px 14px rgba(139,92,246,0.35);">Realizar prueba de nivelación →</a></td></tr><tr><td style="background:#f5f8fc; padding:24px 32px;"><p style="color:#8a93a3; font-size:11px; line-height:1.6; margin:0; text-align:center;">Equipo Haas Academia de Idiomas<br/>Instagram: <a href="https://www.instagram.com/haasidiomas/" style="color:#8b5cf6; text-decoration:none; font-weight:bold;">@haasidiomas</a></p></td></tr></table></td></tr></table>`
    },
    pt: {
      asunto: "Bem-vindo(a) a Haas Academia de Idiomas! Seu beneficio corporativo",
      html: (p) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f6; padding:40px 16px; font-family: Arial, Helvetica, sans-serif;"><tr><td align="center"><table role="presentation" width="580" cellpadding="0" cellspacing="0" style="max-width:580px; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 8px 32px rgba(11,21,40,0.12);"><tr><td style="background:linear-gradient(135deg,#0b1528,#0f2647); padding:40px 32px 32px 32px; text-align:center;"><img src="https://jdppxfokfhqjudwfwckd.supabase.co/storage/v1/object/public/haas-academy/assignments/Melhorar%20Logo%20(3).png" alt="Haas Academy" style="height:36px; margin-bottom:20px;" /><div style="font-size:38px; line-height:1; margin-bottom:12px;">🏢</div><h1 style="color:#ffffff; font-size:22px; margin:0; font-weight:800;">Bem-vindo(a) à Haas Academia!</h1><p style="color:#9fb3d1; font-size:13px; margin:10px 0 0 0;">Seu benefício corporativo já está ativo</p></td></tr><tr><td style="padding:36px 32px 8px 32px;"><p style="color:#0b1528; font-size:16px; line-height:1.6; margin:0 0 8px 0; font-weight:700;">Olá!</p><p style="color:#5a6478; font-size:14px; line-height:1.7; margin:0;">É com grande satisfação que anunciamos que <strong>${p.empresa}</strong> disponibilizou para você um plano corporativo exclusivo de aprendizado de idiomas, com prática real desde o primeiro dia.</p></td></tr><tr><td style="padding:20px 32px 8px 32px;"><div style="background:#f5f8fc; border-radius:12px; padding:18px 20px;"><div style="color:#6d28d9; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Seus dias e horários</div><div style="color:#0b1528; font-size:14px; line-height:1.6;">Dias: <strong>${p.dias}</strong><br/>Horário: <strong>${p.horario}</strong></div></div></td></tr><tr><td style="padding:20px 32px 8px 32px;"><div style="color:#0b1528; font-size:13px; font-weight:800; margin-bottom:10px;">Como ativar seu acesso</div><div style="display:flex; align-items:flex-start; margin-bottom:8px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:24px; height:24px; background:#8b5cf6; border-radius:50%; text-align:center; vertical-align:middle; color:#fff; font-size:12px; font-weight:800;">1</td><td style="padding-left:10px; color:#5a6478; font-size:13px; line-height:1.5;">Clique no botão abaixo para sua prova de nivelamento</td></tr></table></div><div style="display:flex; align-items:flex-start; margin-bottom:8px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:24px; height:24px; background:#8b5cf6; border-radius:50%; text-align:center; vertical-align:middle; color:#fff; font-size:12px; font-weight:800;">2</td><td style="padding-left:10px; color:#5a6478; font-size:13px; line-height:1.5;">Insira este mesmo e-mail</td></tr></table></div><div style="display:flex; align-items:flex-start; margin-bottom:8px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:24px; height:24px; background:#8b5cf6; border-radius:50%; text-align:center; vertical-align:middle; color:#fff; font-size:12px; font-weight:800;">3</td><td style="padding-left:10px; color:#5a6478; font-size:13px; line-height:1.5;">Crie sua senha</td></tr></table></div><div style="display:flex; align-items:flex-start; margin-bottom:8px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:24px; height:24px; background:#8b5cf6; border-radius:50%; text-align:center; vertical-align:middle; color:#fff; font-size:12px; font-weight:800;">4</td><td style="padding-left:10px; color:#5a6478; font-size:13px; line-height:1.5;">Comece a jogar e praticar</td></tr></table></div></td></tr><tr><td style="padding:8px 32px 40px 32px; text-align:center;"><a href="${p.link}" style="background:linear-gradient(135deg,#8b5cf6,#6d28d9); color:#fff; padding:16px 40px; border-radius:10px; text-decoration:none; font-weight:800; font-size:15px; display:inline-block; box-shadow:0 4px 14px rgba(139,92,246,0.35);">Fazer prova de nivelamento →</a></td></tr><tr><td style="background:#f5f8fc; padding:24px 32px;"><p style="color:#8a93a3; font-size:11px; line-height:1.6; margin:0; text-align:center;">Equipe Haas Academia de Idiomas<br/>Instagram: <a href="https://www.instagram.com/haasidiomas/" style="color:#8b5cf6; text-decoration:none; font-weight:bold;">@haasidiomas</a></p></td></tr></table></td></tr></table>`
    },
    en: {
      asunto: "Welcome to Haas Language Academy! Your corporate benefit",
      html: (p) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f6; padding:40px 16px; font-family: Arial, Helvetica, sans-serif;"><tr><td align="center"><table role="presentation" width="580" cellpadding="0" cellspacing="0" style="max-width:580px; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 8px 32px rgba(11,21,40,0.12);"><tr><td style="background:linear-gradient(135deg,#0b1528,#0f2647); padding:40px 32px 32px 32px; text-align:center;"><img src="https://jdppxfokfhqjudwfwckd.supabase.co/storage/v1/object/public/haas-academy/assignments/Melhorar%20Logo%20(3).png" alt="Haas Academy" style="height:36px; margin-bottom:20px;" /><div style="font-size:38px; line-height:1; margin-bottom:12px;">🏢</div><h1 style="color:#ffffff; font-size:22px; margin:0; font-weight:800;">Welcome to Haas Academy!</h1><p style="color:#9fb3d1; font-size:13px; margin:10px 0 0 0;">Your corporate benefit is now active</p></td></tr><tr><td style="padding:36px 32px 8px 32px;"><p style="color:#0b1528; font-size:16px; line-height:1.6; margin:0 0 8px 0; font-weight:700;">Hello!</p><p style="color:#5a6478; font-size:14px; line-height:1.7; margin:0;">We're excited to share that <strong>${p.empresa}</strong> has activated an exclusive corporate language benefit for you, with real practice from day one.</p></td></tr><tr><td style="padding:20px 32px 8px 32px;"><div style="background:#f5f8fc; border-radius:12px; padding:18px 20px;"><div style="color:#6d28d9; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Your class days and schedule</div><div style="color:#0b1528; font-size:14px; line-height:1.6;">Days: <strong>${p.dias}</strong><br/>Time: <strong>${p.horario}</strong></div></div></td></tr><tr><td style="padding:20px 32px 8px 32px;"><div style="color:#0b1528; font-size:13px; font-weight:800; margin-bottom:10px;">How to activate your account</div><div style="display:flex; align-items:flex-start; margin-bottom:8px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:24px; height:24px; background:#8b5cf6; border-radius:50%; text-align:center; vertical-align:middle; color:#fff; font-size:12px; font-weight:800;">1</td><td style="padding-left:10px; color:#5a6478; font-size:13px; line-height:1.5;">Click the button below to take your placement test</td></tr></table></div><div style="display:flex; align-items:flex-start; margin-bottom:8px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:24px; height:24px; background:#8b5cf6; border-radius:50%; text-align:center; vertical-align:middle; color:#fff; font-size:12px; font-weight:800;">2</td><td style="padding-left:10px; color:#5a6478; font-size:13px; line-height:1.5;">Enter this exact email</td></tr></table></div><div style="display:flex; align-items:flex-start; margin-bottom:8px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:24px; height:24px; background:#8b5cf6; border-radius:50%; text-align:center; vertical-align:middle; color:#fff; font-size:12px; font-weight:800;">3</td><td style="padding-left:10px; color:#5a6478; font-size:13px; line-height:1.5;">Create your password</td></tr></table></div><div style="display:flex; align-items:flex-start; margin-bottom:8px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:24px; height:24px; background:#8b5cf6; border-radius:50%; text-align:center; vertical-align:middle; color:#fff; font-size:12px; font-weight:800;">4</td><td style="padding-left:10px; color:#5a6478; font-size:13px; line-height:1.5;">Start playing and learning</td></tr></table></div></td></tr><tr><td style="padding:8px 32px 40px 32px; text-align:center;"><a href="${p.link}" style="background:linear-gradient(135deg,#8b5cf6,#6d28d9); color:#fff; padding:16px 40px; border-radius:10px; text-decoration:none; font-weight:800; font-size:15px; display:inline-block; box-shadow:0 4px 14px rgba(139,92,246,0.35);">Take placement test →</a></td></tr><tr><td style="background:#f5f8fc; padding:24px 32px;"><p style="color:#8a93a3; font-size:11px; line-height:1.6; margin:0; text-align:center;">Haas Language Academy Team<br/>Instagram: <a href="https://www.instagram.com/haasidiomas/" style="color:#8b5cf6; text-decoration:none; font-weight:bold;">@haasidiomas</a></p></td></tr></table></td></tr></table>`
    }
  },
  flexible: {
    es: {
      asunto: "Bienvenido(a) a Haas Academia de Idiomas! Programa tu agenda",
      html: (p) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f6; padding:40px 16px; font-family: Arial, Helvetica, sans-serif;"><tr><td align="center"><table role="presentation" width="580" cellpadding="0" cellspacing="0" style="max-width:580px; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 8px 32px rgba(11,21,40,0.12);"><tr><td style="background:linear-gradient(135deg,#0b1528,#0f2647); padding:40px 32px 32px 32px; text-align:center;"><img src="https://jdppxfokfhqjudwfwckd.supabase.co/storage/v1/object/public/haas-academy/assignments/Melhorar%20Logo%20(3).png" alt="Haas Academy" style="height:36px; margin-bottom:20px;" /><div style="font-size:38px; line-height:1; margin-bottom:12px;">🏢</div><h1 style="color:#ffffff; font-size:22px; margin:0; font-weight:800;">¡Bienvenido(a) a Haas Academia!</h1><p style="color:#9fb3d1; font-size:13px; margin:10px 0 0 0;">Tu beneficio corporativo, a tu ritmo</p></td></tr><tr><td style="padding:36px 32px 8px 32px;"><p style="color:#0b1528; font-size:16px; line-height:1.6; margin:0 0 8px 0; font-weight:700;">¡Hola!</p><p style="color:#5a6478; font-size:14px; line-height:1.7; margin:0;">Nos alegra comunicarte que <strong>${p.empresa}</strong> activó para ti un plan corporativo exclusivo, 100% flexible y adaptado a tu rutina.</p></td></tr><tr><td style="padding:20px 32px 8px 32px;"><div style="color:#0b1528; font-size:13px; font-weight:800; margin-bottom:10px;">Cómo activar tu cuenta</div><div style="display:flex; align-items:flex-start; margin-bottom:8px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:24px; height:24px; background:#8b5cf6; border-radius:50%; text-align:center; vertical-align:middle; color:#fff; font-size:12px; font-weight:800;">1</td><td style="padding-left:10px; color:#5a6478; font-size:13px; line-height:1.5;">Haz clic en el botón para tu prueba de nivelación</td></tr></table></div><div style="display:flex; align-items:flex-start; margin-bottom:8px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:24px; height:24px; background:#8b5cf6; border-radius:50%; text-align:center; vertical-align:middle; color:#fff; font-size:12px; font-weight:800;">2</td><td style="padding-left:10px; color:#5a6478; font-size:13px; line-height:1.5;">Ingresa este mismo correo</td></tr></table></div><div style="display:flex; align-items:flex-start; margin-bottom:8px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:24px; height:24px; background:#8b5cf6; border-radius:50%; text-align:center; vertical-align:middle; color:#fff; font-size:12px; font-weight:800;">3</td><td style="padding-left:10px; color:#5a6478; font-size:13px; line-height:1.5;">Crea tu contraseña</td></tr></table></div><div style="display:flex; align-items:flex-start; margin-bottom:8px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:24px; height:24px; background:#8b5cf6; border-radius:50%; text-align:center; vertical-align:middle; color:#fff; font-size:12px; font-weight:800;">4</td><td style="padding-left:10px; color:#5a6478; font-size:13px; line-height:1.5;">Empieza a jugar y agenda tus clases</td></tr></table></div></td></tr><tr><td style="padding:20px 32px 8px 32px;"><div style="background:#f5f8fc; border-radius:12px; padding:18px 20px;"><div style="color:#6d28d9; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Cómo agendar tus clases</div><div style="color:#0b1528; font-size:14px; line-height:1.6;">Ingresa a tu Dashboard, haz clic en <strong>AGENDA</strong> y elige los días y horarios que mejor se adapten a tu semana.</div></div></td></tr><tr><td style="padding:8px 32px 40px 32px; text-align:center;"><a href="${p.link}" style="background:linear-gradient(135deg,#8b5cf6,#6d28d9); color:#fff; padding:16px 40px; border-radius:10px; text-decoration:none; font-weight:800; font-size:15px; display:inline-block; box-shadow:0 4px 14px rgba(139,92,246,0.35);">Realizar prueba de nivelación →</a></td></tr><tr><td style="background:#f5f8fc; padding:24px 32px;"><p style="color:#8a93a3; font-size:11px; line-height:1.6; margin:0; text-align:center;">Equipo Haas Academia de Idiomas<br/>Instagram: <a href="https://www.instagram.com/haasidiomas/" style="color:#8b5cf6; text-decoration:none; font-weight:bold;">@haasidiomas</a></p></td></tr></table></td></tr></table>`
    },
    pt: {
      asunto: "Bem-vindo(a) a Haas Academia de Idiomas! Monte sua agenda",
      html: (p) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f6; padding:40px 16px; font-family: Arial, Helvetica, sans-serif;"><tr><td align="center"><table role="presentation" width="580" cellpadding="0" cellspacing="0" style="max-width:580px; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 8px 32px rgba(11,21,40,0.12);"><tr><td style="background:linear-gradient(135deg,#0b1528,#0f2647); padding:40px 32px 32px 32px; text-align:center;"><img src="https://jdppxfokfhqjudwfwckd.supabase.co/storage/v1/object/public/haas-academy/assignments/Melhorar%20Logo%20(3).png" alt="Haas Academy" style="height:36px; margin-bottom:20px;" /><div style="font-size:38px; line-height:1; margin-bottom:12px;">🏢</div><h1 style="color:#ffffff; font-size:22px; margin:0; font-weight:800;">Bem-vindo(a) à Haas Academia!</h1><p style="color:#9fb3d1; font-size:13px; margin:10px 0 0 0;">Seu benefício corporativo, no seu ritmo</p></td></tr><tr><td style="padding:36px 32px 8px 32px;"><p style="color:#0b1528; font-size:16px; line-height:1.6; margin:0 0 8px 0; font-weight:700;">Olá!</p><p style="color:#5a6478; font-size:14px; line-height:1.7; margin:0;"><strong>${p.empresa}</strong> disponibilizou para você um plano corporativo exclusivo, 100% flexível e adaptado à sua rotina.</p></td></tr><tr><td style="padding:20px 32px 8px 32px;"><div style="color:#0b1528; font-size:13px; font-weight:800; margin-bottom:10px;">Como ativar sua conta</div><div style="display:flex; align-items:flex-start; margin-bottom:8px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:24px; height:24px; background:#8b5cf6; border-radius:50%; text-align:center; vertical-align:middle; color:#fff; font-size:12px; font-weight:800;">1</td><td style="padding-left:10px; color:#5a6478; font-size:13px; line-height:1.5;">Clique no botão para sua prova de nivelamento</td></tr></table></div><div style="display:flex; align-items:flex-start; margin-bottom:8px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:24px; height:24px; background:#8b5cf6; border-radius:50%; text-align:center; vertical-align:middle; color:#fff; font-size:12px; font-weight:800;">2</td><td style="padding-left:10px; color:#5a6478; font-size:13px; line-height:1.5;">Insira este mesmo e-mail</td></tr></table></div><div style="display:flex; align-items:flex-start; margin-bottom:8px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:24px; height:24px; background:#8b5cf6; border-radius:50%; text-align:center; vertical-align:middle; color:#fff; font-size:12px; font-weight:800;">3</td><td style="padding-left:10px; color:#5a6478; font-size:13px; line-height:1.5;">Crie sua senha</td></tr></table></div><div style="display:flex; align-items:flex-start; margin-bottom:8px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:24px; height:24px; background:#8b5cf6; border-radius:50%; text-align:center; vertical-align:middle; color:#fff; font-size:12px; font-weight:800;">4</td><td style="padding-left:10px; color:#5a6478; font-size:13px; line-height:1.5;">Comece a jogar e agende suas aulas</td></tr></table></div></td></tr><tr><td style="padding:20px 32px 8px 32px;"><div style="background:#f5f8fc; border-radius:12px; padding:18px 20px;"><div style="color:#6d28d9; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Como agendar suas aulas</div><div style="color:#0b1528; font-size:14px; line-height:1.6;">Acesse seu Dashboard, clique em <strong>AGENDA</strong> e escolha os dias e horários que melhor encaixam na sua semana.</div></div></td></tr><tr><td style="padding:8px 32px 40px 32px; text-align:center;"><a href="${p.link}" style="background:linear-gradient(135deg,#8b5cf6,#6d28d9); color:#fff; padding:16px 40px; border-radius:10px; text-decoration:none; font-weight:800; font-size:15px; display:inline-block; box-shadow:0 4px 14px rgba(139,92,246,0.35);">Fazer prova de nivelamento →</a></td></tr><tr><td style="background:#f5f8fc; padding:24px 32px;"><p style="color:#8a93a3; font-size:11px; line-height:1.6; margin:0; text-align:center;">Equipe Haas Academia de Idiomas<br/>Instagram: <a href="https://www.instagram.com/haasidiomas/" style="color:#8b5cf6; text-decoration:none; font-weight:bold;">@haasidiomas</a></p></td></tr></table></td></tr></table>`
    },
    en: {
      asunto: "Welcome to Haas Language Academy! Schedule your classes",
      html: (p) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f6; padding:40px 16px; font-family: Arial, Helvetica, sans-serif;"><tr><td align="center"><table role="presentation" width="580" cellpadding="0" cellspacing="0" style="max-width:580px; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 8px 32px rgba(11,21,40,0.12);"><tr><td style="background:linear-gradient(135deg,#0b1528,#0f2647); padding:40px 32px 32px 32px; text-align:center;"><img src="https://jdppxfokfhqjudwfwckd.supabase.co/storage/v1/object/public/haas-academy/assignments/Melhorar%20Logo%20(3).png" alt="Haas Academy" style="height:36px; margin-bottom:20px;" /><div style="font-size:38px; line-height:1; margin-bottom:12px;">🏢</div><h1 style="color:#ffffff; font-size:22px; margin:0; font-weight:800;">Welcome to Haas Academy!</h1><p style="color:#9fb3d1; font-size:13px; margin:10px 0 0 0;">Your corporate benefit, at your own pace</p></td></tr><tr><td style="padding:36px 32px 8px 32px;"><p style="color:#0b1528; font-size:16px; line-height:1.6; margin:0 0 8px 0; font-weight:700;">Hello!</p><p style="color:#5a6478; font-size:14px; line-height:1.7; margin:0;"><strong>${p.empresa}</strong> has activated an exclusive corporate plan for you, fully flexible and adapted to your schedule.</p></td></tr><tr><td style="padding:20px 32px 8px 32px;"><div style="color:#0b1528; font-size:13px; font-weight:800; margin-bottom:10px;">How to activate your account</div><div style="display:flex; align-items:flex-start; margin-bottom:8px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:24px; height:24px; background:#8b5cf6; border-radius:50%; text-align:center; vertical-align:middle; color:#fff; font-size:12px; font-weight:800;">1</td><td style="padding-left:10px; color:#5a6478; font-size:13px; line-height:1.5;">Click the button below for your placement test</td></tr></table></div><div style="display:flex; align-items:flex-start; margin-bottom:8px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:24px; height:24px; background:#8b5cf6; border-radius:50%; text-align:center; vertical-align:middle; color:#fff; font-size:12px; font-weight:800;">2</td><td style="padding-left:10px; color:#5a6478; font-size:13px; line-height:1.5;">Enter this exact email</td></tr></table></div><div style="display:flex; align-items:flex-start; margin-bottom:8px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:24px; height:24px; background:#8b5cf6; border-radius:50%; text-align:center; vertical-align:middle; color:#fff; font-size:12px; font-weight:800;">3</td><td style="padding-left:10px; color:#5a6478; font-size:13px; line-height:1.5;">Create your password</td></tr></table></div><div style="display:flex; align-items:flex-start; margin-bottom:8px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:24px; height:24px; background:#8b5cf6; border-radius:50%; text-align:center; vertical-align:middle; color:#fff; font-size:12px; font-weight:800;">4</td><td style="padding-left:10px; color:#5a6478; font-size:13px; line-height:1.5;">Start playing and book your classes</td></tr></table></div></td></tr><tr><td style="padding:20px 32px 8px 32px;"><div style="background:#f5f8fc; border-radius:12px; padding:18px 20px;"><div style="color:#6d28d9; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">How to schedule your classes</div><div style="color:#0b1528; font-size:14px; line-height:1.6;">Log in to your Dashboard, click <strong>AGENDA</strong> and pick the days and times that best fit your week.</div></div></td></tr><tr><td style="padding:8px 32px 40px 32px; text-align:center;"><a href="${p.link}" style="background:linear-gradient(135deg,#8b5cf6,#6d28d9); color:#fff; padding:16px 40px; border-radius:10px; text-decoration:none; font-weight:800; font-size:15px; display:inline-block; box-shadow:0 4px 14px rgba(139,92,246,0.35);">Take placement test →</a></td></tr><tr><td style="background:#f5f8fc; padding:24px 32px;"><p style="color:#8a93a3; font-size:11px; line-height:1.6; margin:0; text-align:center;">Haas Language Academy Team<br/>Instagram: <a href="https://www.instagram.com/haasidiomas/" style="color:#8b5cf6; text-decoration:none; font-weight:bold;">@haasidiomas</a></p></td></tr></table></td></tr></table>`
    }
  }
};

function GestionarPlanInterno() {
  const router = useRouter();
  const [empresa, setEmpresa] = useState<any>(null);
  const [planos, setPlanos] = useState<any[]>([]);
  const [grupos, setGrupos] = useState<any[]>([]);
  const [descontoConfig, setDescontoConfig] = useState({ desconto_por_pessoa: 1.5, desconto_maximo: 25 });
  const [historicoPagos, setHistoricoPagos] = useState<any[]>([]);
  const [convitesPendentes, setConvitesPendentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [tipoHorario, setTipoHorario] = useState("fijo");
  const [simPlano, setSimPlano] = useState<any>(null);
  const [simPessoas, setSimPessoas] = useState(0);

  const [nomeNovo, setNomeNovo] = useState("");
  const [idiomaCursoNovo, setIdiomaCursoNovo] = useState("");
  const [diasSelecionados, setDiasSelecionados] = useState<string[]>([]);
  const [emailNovo, setEmailNovo] = useState("");
  const [diasClase, setDiasClase] = useState("");
  const [horarioClase, setHorarioClase] = useState("");
  const [idiomaEmail, setIdiomaEmail] = useState("es");
  const [idioma, setIdiomaState] = useState<"PT" | "ES" | "EN">(() => {
    if (typeof window !== "undefined") {
      const salvo = localStorage.getItem("haas_corporate_idioma");
      if (salvo === "PT" || salvo === "ES" || salvo === "EN") return salvo;
    }
    return "ES";
  });
  const setIdioma = (l: "PT" | "ES" | "EN") => {
    setIdiomaState(l);
    if (typeof window !== "undefined") localStorage.setItem("haas_corporate_idioma", l);
  };

  const dictG = {
    PT: {
      voltarPainel: "Voltar ao painel",
      simuladorPlano: "Simulador de plano",
      escolhaTipo: "Escolha o tipo de horário e quantas pessoas deseja inscrever.",
      horarioFixo: "Horário fixo",
      horarioLivre: "Horário livre (Agenda)",
      colaboradores: "Colaboradores",
      desconto: "Desconto",
      totalMensal: "Total mensal",
      totalAtual: "Total atual (todos os planos)",
      planosAtivos: "plano(s) ativo(s)",
      semPlanos: "Nenhum plano ativo.",
      ultimoPago: "Último pagamento",
      semPagos: "Nenhum pagamento.",
      continuar: "Continuar",
      pagar: "Pagar",
      verMaisDetalhes: "Ver mais detalhes",
      confirmarPago: "Confirmar pagamento",
      verOpcoes: "Ver opções de pagamento",
      cartaoCredito: "Cartão de Crédito / Débito",
      colaboradoresPlano: "Colaboradores neste plano",
      nenhumColaborador: "Nenhum ainda.",
      nomeCompleto: "Nome completo",
      selecioneIdioma: "Selecione o idioma do curso",
      selecioneDias: "Selecione",
      diasSelecionados: "selecionados",
      dias_label: "dias",
      horario_label: "Horário",
      revisarEnviar: "Revisar e enviar",
      diasSemana: ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"],
      gatewaySeguro: "Gateway seguro Wompi / Nequi",
      base: "Base",
      feePasarela: "Taxa do gateway",
      total_pg: "Total",
      pagarViaWompi: "Pagar via Wompi / Nequi",
      notaWompi: "Ao processar o valor exato indicado, o gateway gerenciará a ativação do seu plano de forma automática. Nota: a taxa de processamento é cobrada pela plataforma e não é reembolsável em caso de cancelamento.",
      ahorraComision: "¡Economize a Taxa!",
      llaveBreB: "Chave Bre-B",
      comissao: "Comissão",
      gratis: "Grátis!",
      aTransferir: "A transferir",
      atencao: "ATENÇÃO",
      notaBreB: "Lembre-se de inserir o valor exato com desconto no seu banco; isso permite que o sistema valide seu pagamento digitalmente e gerencie a ativação de forma automática.",
      jaTransferi: "Já transferi"
    },
    ES: {
      voltarPainel: "Volver al panel",
      simuladorPlano: "Simulador de plan",
      escolhaTipo: "Elige el tipo de horario y cuántas personas quieres inscribir.",
      horarioFixo: "Horario fijo",
      horarioLivre: "Horario libre (Agenda)",
      colaboradores: "Colaboradores",
      desconto: "Descuento",
      totalMensal: "Total mensual",
      totalAtual: "Total actual (todos los planes)",
      planosAtivos: "plan(es) activo(s)",
      semPlanos: "Sin planes activos.",
      ultimoPago: "Último pago",
      semPagos: "Sin pagos.",
      continuar: "Continuar",
      pagar: "Pagar",
      verMaisDetalhes: "Ver más detalles",
      confirmarPago: "Confirmar pago",
      verOpcoes: "Ver opciones de pago",
      cartaoCredito: "Tarjeta de Crédito / Débito",
      colaboradoresPlano: "Colaboradores en este plan",
      nenhumColaborador: "Ninguno todavía.",
      nomeCompleto: "Nombre completo",
      selecioneIdioma: "Selecciona el idioma del curso",
      selecioneDias: "Selecciona",
      diasSelecionados: "seleccionados",
      dias_label: "días",
      horario_label: "Horario",
      revisarEnviar: "Revisar y enviar",
      diasSemana: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
      gatewaySeguro: "Pasarela segura Wompi / Nequi",
      base: "Base",
      feePasarela: "Fee pasarela",
      total_pg: "Total",
      pagarViaWompi: "Pagar vía Wompi / Nequi",
      notaWompi: "Al procesar el valor exacto indicado, la pasarela gestionará la activación de tu plan de forma automática. Nota: la comisión de procesamiento es cobrada por la plataforma y no es reembolsable en caso de cancelación.",
      ahorraComision: "¡Ahorra Comisión!",
      llaveBreB: "Llave Bre-B",
      comissao: "Comisión",
      gratis: "¡Gratis!",
      aTransferir: "A transferir",
      atencao: "ATENCIÓN",
      notaBreB: "Recuerda ingresar el valor exacto con descuento en tu banco; esto permite que el sistema valide tu pago digitalmente y gestione la activación de forma automática.",
      jaTransferi: "Ya transferí"
    },
    EN: {
      voltarPainel: "Back to dashboard",
      simuladorPlano: "Plan simulator",
      escolhaTipo: "Choose the schedule type and how many people you want to enroll.",
      horarioFixo: "Fixed schedule",
      horarioLivre: "Flexible schedule (Calendar)",
      colaboradores: "Employees",
      desconto: "Discount",
      totalMensal: "Monthly total",
      totalAtual: "Current total (all plans)",
      planosAtivos: "active plan(s)",
      semPlanos: "No active plans.",
      ultimoPago: "Last payment",
      semPagos: "No payments.",
      continuar: "Continue",
      pagar: "Pay",
      verMaisDetalhes: "See more details",
      confirmarPago: "Confirm payment",
      verOpcoes: "View payment options",
      cartaoCredito: "Credit / Debit Card",
      colaboradoresPlano: "Employees in this plan",
      nenhumColaborador: "None yet.",
      nomeCompleto: "Full name",
      selecioneIdioma: "Select the course language",
      selecioneDias: "Select",
      diasSelecionados: "selected",
      dias_label: "days",
      horario_label: "Schedule",
      revisarEnviar: "Review and submit",
      diasSemana: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      gatewaySeguro: "Secure gateway Wompi / Nequi",
      base: "Base",
      feePasarela: "Gateway fee",
      total_pg: "Total",
      pagarViaWompi: "Pay via Wompi / Nequi",
      notaWompi: "By processing the exact amount indicated, the gateway will automatically manage the activation of your plan. Note: the processing fee is charged by the platform and is non-refundable in case of cancellation.",
      ahorraComision: "Save on Fees!",
      llaveBreB: "Bre-B Key",
      comissao: "Commission",
      gratis: "Free!",
      aTransferir: "Amount to transfer",
      atencao: "ATTENTION",
      notaBreB: "Remember to enter the exact discounted amount in your bank; this allows the system to digitally validate your payment and manage activation automatically.",
      jaTransferi: "I already transferred"
    }
  };
  const tG = dictG[idioma];

  const traduzirPlano = (planKey: string, labelOriginal: string) => {
    const mapa: Record<string, { PT: string; ES: string; EN: string }> = {
      "3x_semana": { PT: "3x por semana", ES: "3x por semana", EN: "3x a week" },
      "5x_semana": { PT: "5x por semana", ES: "5x por semana", EN: "5x a week" },
      "particular": { PT: "Aulas Particulares", ES: "Clases Particulares", EN: "Private Lessons" },
      "3x_semana_flex": { PT: "3x semana - Horário livre", ES: "3x semana - Horario libre", EN: "3x week - Flexible schedule" },
      "5x_semana_flex": { PT: "5x semana - Horário livre", ES: "5x semana - Horario libre", EN: "5x week - Flexible schedule" },
      "particular_flex": { PT: "Particular - Horário livre", ES: "Particular - Horario libre", EN: "Private - Flexible schedule" }
    };
    return mapa[planKey] ? mapa[planKey][idioma] : labelOriginal;
  };
  const [modalAberto, setModalAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [msgAccion, setMsgAccion] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(""), 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  const [mostrarPago, setMostrarPago] = useState(false);
  const [mostrarFormAgregar, setMostrarFormAgregar] = useState(false);
  const [filaColaboradores, setFilaColaboradores] = useState<any[]>([]);
  const [indiceFila, setIndiceFila] = useState(0);

  const adicionarMaisAlguem = () => {
    if (!nomeNovo.trim() || !emailNovo.trim() || !emailNovo.includes("@") || !idiomaCursoNovo) return;
    if (tipoHorario === "fijo") {
      const diasReq = simPlano?.plan_key === "3x_semana" ? 3 : simPlano?.plan_key === "5x_semana" ? 5 : 0;
      if (diasReq > 0 && diasSelecionados.length !== diasReq) return;
      if (!horarioClase) return;
    }
    const novaPessoa = {
      nome: nomeNovo.trim(),
      email: emailNovo.trim(),
      idiomaCurso: idiomaCursoNovo,
      dias: tipoHorario === "fijo" ? diasClase : null,
      horario: tipoHorario === "fijo" ? horarioClase : null,
    };
    setFilaColaboradores((prev) => [...prev, novaPessoa]);
    setIndiceFila(filaColaboradores.length);
    setNomeNovo("");
    setEmailNovo("");
    setIdiomaCursoNovo("");
    setDiasSelecionados([]);
    setDiasClase("");
    setHorarioClase("");
  };

  const removerDaFila = (idx: number) => {
    setFilaColaboradores((prev) => prev.filter((_, i) => i !== idx));
    setIndiceFila((prev) => Math.max(0, Math.min(prev, filaColaboradores.length - 2)));
  };
  const [mostrarOpcoesPagamento, setMostrarOpcoesPagamento] = useState(false);
  const [criandoCobranca, setCriandoCobranca] = useState(false);
  const [cobrancaMsg, setCobrancaMsg] = useState("");
  const colDireitaRef = useRef<HTMLDivElement>(null);
  const [alturaColDireita, setAlturaColDireita] = useState<number | null>(null);

  useEffect(() => {
    if (!colDireitaRef.current) return;
    const elemento = colDireitaRef.current;
    const medir = () => setAlturaColDireita(elemento.getBoundingClientRect().height);
    const t1 = setTimeout(medir, 50);
    const t2 = setTimeout(medir, 300);
    const t3 = setTimeout(medir, 800);
    const observer = new ResizeObserver(medir);
    observer.observe(elemento);
    window.addEventListener("resize", medir);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      observer.disconnect();
      window.removeEventListener("resize", medir);
    };
  }, [simPlano]);

  useEffect(() => {
    const carregar = async () => {
      const corporateId = localStorage.getItem("haas_corporate_id");
      const corporateName = localStorage.getItem("haas_corporate_name");
      if (!corporateId) {
        setErro("Sesion no encontrada.");
        setLoading(false);
        return;
      }
      setEmpresa({ id: corporateId, company_name: corporateName || "Empresa" });

      const { data: planosReais } = await supabase.from("corporate_plan_prices").select("plan_key, plan_label, price, tipo_horario").order("price");
      if (planosReais) setPlanos(planosReais);

      const { data: gruposReais } = await supabase.from("corporate_groups").select("id, plan_key").eq("corporate_account_id", corporateId);
      if (gruposReais) {
        const { data: funcionarios } = await supabase.from("users").select("id, name, email, corporate_group_id, corporate_next_due_date, corporate_payment_status").eq("corporate_account_id", corporateId);
        setGrupos(gruposReais.map((g: any) => ({ ...g, membros: (funcionarios || []).filter((f: any) => f.corporate_group_id === g.id) })));
      }

      const { data: descontoReal } = await supabase.from("corporate_discount_config").select("desconto_por_pessoa, desconto_maximo").limit(1).maybeSingle();
      if (descontoReal) setDescontoConfig(descontoReal);

      const { data: pagos } = await supabase.from("corporate_payments").select("amount, status, created_at").eq("corporate_account_id", corporateId).order("created_at", { ascending: false }).limit(8);
      if (pagos) setHistoricoPagos(pagos);

      const { data: convites } = await supabase.from("corporate_pending_invites").select("id, plan_key, nombre, email").eq("corporate_account_id", corporateId);
      if (convites) setConvitesPendentes(convites);

      if (gruposReais && gruposReais.length > 0 && planosReais) {
        const { data: funcionarios2 } = await supabase.from("users").select("id, corporate_group_id").eq("corporate_account_id", corporateId);
        const gruposComMembros = gruposReais.map((g: any) => ({ ...g, qtd: (funcionarios2 || []).filter((f: any) => f.corporate_group_id === g.id).length }));
        const grupoAtivo = gruposComMembros.filter((g: any) => g.qtd > 0).sort((a: any, b: any) => b.qtd - a.qtd)[0];
        if (grupoAtivo) {
          const planoAtivo = planosReais.find((p: any) => p.plan_key === grupoAtivo.plan_key);
          if (planoAtivo) {
            setTipoHorario(planoAtivo.tipo_horario);
            setSimPlano(planoAtivo);
            setSimPessoas(Math.max(1, grupoAtivo.qtd));
          }
        }
      }

      setLoading(false);
    };
    carregar();
  }, []);

  const centavosUnicos = (email: string) => {
    let hash = 0;
    for (let i = 0; i < email.length; i++) hash += email.charCodeAt(i);
    return (hash % 95) + 1;
  };

  const planosFiltrados = planos.filter((p) => p.tipo_horario === tipoHorario && p.plan_key !== "particular" && p.plan_key !== "particular_flex");
  const grupoAtual = simPlano ? grupos.find((g) => g.plan_key === simPlano.plan_key) : null;
  const membrosAtuais = grupoAtual?.membros || [];

  const handleEscolherPlano = (p: any) => {
    setSimPlano(p);
    const grupo = grupos.find((g) => g.plan_key === p.plan_key);
    setSimPessoas(grupo?.membros.length || 0);
  };

  const searchParams = useSearchParams();
  useEffect(() => {
    const planKeyUrl = searchParams.get("plan_key");
    if (planKeyUrl && planos.length > 0) {
      const p = planos.find((pl) => pl.plan_key === planKeyUrl);
      if (p) {
        setTipoHorario(p.tipo_horario);
        handleEscolherPlano(p);
      }
    }
  }, [searchParams, planos]);

  const handleAbrirModal = () => {
    if (!nomeNovo.trim() || !emailNovo.trim() || !emailNovo.includes("@")) {
      setMsgAccion("Completa el nombre y el correo antes de continuar.");
      return;
    }
    if (!idiomaCursoNovo) {
      setMsgAccion("Selecciona el idioma del curso antes de continuar.");
      return;
    }
    if (tipoHorario === "fijo") {
      const diasRequeridos = simPlano?.plan_key === "3x_semana" ? 3 : simPlano?.plan_key === "5x_semana" ? 5 : 0;
      if (diasRequeridos > 0 && diasSelecionados.length !== diasRequeridos) {
        setMsgAccion(`Selecciona exactamente ${diasRequeridos} dias para este plan.`);
        return;
      }
      if (!horarioClase) {
        setMsgAccion("Selecciona el horario antes de continuar.");
        return;
      }
    }
    setMsgAccion("");
    setModalAberto(true);
  };

  const handleConfirmarEnvio = async () => {
    setEnviando(true);
    setMsgAccion("");
    try {
      const pessoaAtual = {
        nome: nomeNovo.trim(),
        email: emailNovo.trim(),
        idiomaCurso: idiomaCursoNovo,
        dias: tipoHorario === "fijo" ? diasClase : null,
        horario: tipoHorario === "fijo" ? horarioClase : null,
      };
      const todosParaEnviar = [...filaColaboradores, pessoaAtual];

      for (const pessoa of todosParaEnviar) {
        const resCadastro = await fetch("/api/portal-empresa/agregar-colaborador", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            corporate_account_id: empresa.id,
            plan_key: simPlano.plan_key,
            nombre: pessoa.nome,
            idioma_curso: pessoa.idiomaCurso,
            email: pessoa.email,
            dias: pessoa.dias,
            horario: pessoa.horario
          })
        });
        const dadosCadastro = await resCadastro.json();
        if (!resCadastro.ok) throw new Error(pessoa.nome + ": " + dadosCadastro.error);
        const template = TEMPLATES_EMAIL[tipoHorario][idiomaEmail];
        const html = template.html({ empresa: empresa?.company_name, dias: pessoa.dias || "-", horario: pessoa.horario || "-", link: "https://academiahaas.com/diagnostico" });
        await fetch("/api/email/enviar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ destinatario: pessoa.email, assunto: template.asunto, corpoHtml: html })
        });
      }

      const totalEnviados = todosParaEnviar.length;
      setFilaColaboradores([]);
      setIndiceFila(0);
      setIdiomaCursoNovo("");
      setModalAberto(false);
      setNomeNovo("");
      setEmailNovo("");
      setDiasClase("");
      setHorarioClase("");
      setMostrarFormAgregar(false);
      setToastMsg(idioma === "PT" ? ("✓ " + totalEnviados + " convite(s) enviado(s) com sucesso") : idioma === "EN" ? ("✓ " + totalEnviados + " invitation(s) sent successfully") : ("✓ " + totalEnviados + " invitación(es) enviada(s) con éxito"));
      setTimeout(() => {
        router.push(`/portal-empresa/pagamento?plan_key=${simPlano.plan_key}&pessoas=${simPessoas + totalEnviados}&group_id=${grupoAtual?.id || ''}`);
      }, 1200);
    } catch (e: any) {
      setMsgAccion("Error: " + e.message);
    } finally {
      setEnviando(false);
    }
  };

  const [modalPresenca, setModalPresenca] = useState<{ userId: string; nome: string } | null>(null);
  const [diasPresenca, setDiasPresenca] = useState<any[]>([]);
  const [carregandoPresenca, setCarregandoPresenca] = useState(false);

  const abrirPresenca = async (userId: string, nome: string) => {
    setModalPresenca({ userId, nome });
    setCarregandoPresenca(true);
    const { data: matriculas } = await supabase
      .from("aula_matriculas")
      .select("aula_id, aulas_disponiveis!inner(data_hora_fim)")
      .eq("user_id", userId)
      .lt("aulas_disponiveis.data_hora_fim", new Date().toISOString())
      .order("aulas_disponiveis(data_hora_fim)", { ascending: false })
      .limit(60);
    const { data: avaliacoes } = await supabase
      .from("class_evaluations")
      .select("aula_id, presente")
      .eq("user_id", userId);
    const mapaPresenca = new Map((avaliacoes || []).map((a: any) => [a.aula_id, a.presente]));
    const lista = (matriculas || []).map((m: any) => ({
      data: m.aulas_disponiveis?.data_hora_fim,
      presente: mapaPresenca.has(m.aula_id) ? mapaPresenca.get(m.aula_id) : null,
    }));
    setDiasPresenca(lista);
    setCarregandoPresenca(false);
  };

  const handleRemoverColaborador = async (email: string) => {
    if (!empresa) return;
    setEnviando(true);
    setMsgAccion("");
    try {
      const res = await fetch("/api/portal-empresa/remover-colaborador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, corporate_account_id: empresa.id })
      });
      const dados = await res.json();
      if (!res.ok) throw new Error(dados.error);
      setMsgAccion(`${dados.removido.name || dados.removido.email} fue retirado.`);
      setGrupos((prev) => prev.map((g) => g.id === grupoAtual?.id ? { ...g, membros: g.membros.filter((m: any) => m.email !== email) } : g));
    } catch (e: any) {
      setMsgAccion("Error: " + e.message);
    } finally {
      setEnviando(false);
    }
  };

  const handlePagar = async (valorExacto: number, abrirWompi: boolean = true) => {
    if (!empresa) return;
    setCriandoCobranca(true);
    setCobrancaMsg("");
    try {
      const email = localStorage.getItem("haas_corporate_email") || "";
      const res = await fetch("/api/portal-empresa/criar-cobranca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ corporate_account_id: empresa.id, boss_email: email, amount: valorExacto })
      });
      const dados = await res.json();
      if (!res.ok) throw new Error(dados.error);
      if (abrirWompi) {
        setCobrancaMsg("Cobranza registrada. Completa el pago en la ventana que se abrio.");
        window.open("https://checkout.nequi.wompi.co/l/Nhopn2", "_blank");
      } else {
        setCobrancaMsg("Transferencia registrada. El sistema validara tu pago automaticamente al recibirla.");
      }
    } catch (e: any) {
      setCobrancaMsg("Error: " + e.message);
    } finally {
      setCriandoCobranca(false);
    }
  };

  const handleGerarPDF = () => {
    if (!simPlano) return;
    const ventana = window.open("", "_blank");
    if (!ventana) return;
    ventana.document.write(`
      <html><head><title>Presupuesto - ${empresa?.company_name}</title>
      <style>body{font-family:Arial;padding:40px;color:#1e293b;} h1{color:#7c3aed;} table{width:100%;border-collapse:collapse;margin-top:20px;} td{padding:8px 0;border-bottom:1px solid #e2e8f0;}</style>
      </head><body>
      <h1>Presupuesto Haas Academia de Idiomas</h1>
      <p><strong>Empresa:</strong> ${empresa?.company_name}</p>
      <p><strong>Fecha:</strong> ${new Date().toLocaleDateString("es-CO")}</p>
      <table>
        <tr><td>Plan</td><td>${simPlano.plan_label}</td></tr>
        <tr><td>Tipo de horario</td><td>${tipoHorario === "fijo" ? "Fijo" : "Libre (Agenda)"}</td></tr>
        <tr><td>Colaboradores</td><td>${simPessoas}</td></tr>
        <tr><td>Descuento</td><td>${desconto.toFixed(1)}%</td></tr>
        <tr><td><strong>Total mensual</strong></td><td><strong>$ ${Math.round(total).toLocaleString("es-CO")} COP</strong></td></tr>
      </table>
      </body></html>
    `);
    ventana.document.close();
    setTimeout(() => ventana.print(), 300);
  };

  const desconto = simPlano ? Math.min(descontoConfig.desconto_maximo, (simPessoas - 1) * descontoConfig.desconto_por_pessoa) : 0;
  const subtotal = simPlano ? Number(simPlano.price) * simPessoas : 0;
  const total = subtotal * (1 - desconto / 100);
  const progresso = (desconto / descontoConfig.desconto_maximo) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030914] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="animate-spin text-purple-400" size={32} />
        <p className="text-sm font-medium">Cargando...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen bg-[#030914] flex flex-col items-center justify-center gap-3 text-slate-400 p-6 text-center">
        <p className="text-sm font-medium text-rose-400">{erro}</p>
      </div>
    );
  }

  const bossEmail = typeof window !== "undefined" ? (localStorage.getItem("haas_corporate_email") || "haas") : "haas";
  const centavos = centavosUnicos(bossEmail);
  const preview = TEMPLATES_EMAIL[tipoHorario][idiomaEmail].html({ empresa: empresa?.company_name, dias: diasClase || "___", horario: horarioClase || "___", link: "https://academiahaas.com/diagnostico" });

  return (
    <div className="h-screen overflow-hidden bg-[#030914] text-slate-100 flex flex-col">
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

      <header className="h-16 border-b border-white/10 bg-[#0a1424] px-6 md:px-10 flex items-center justify-between shrink-0">
        <Link href="/portal-empresa" className="flex items-center gap-2 text-xs text-slate-400 hover:text-purple-400 transition-colors">
          <ArrowLeft size={14} /> {tG.voltarPainel}
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            {(["PT", "ES", "EN"] as const).map((l) => (
              <button key={l} onClick={() => setIdioma(l)} className={`text-[10px] font-bold px-2 py-1 rounded ${idioma === l ? "bg-purple-500/20 text-purple-400" : "text-slate-500"}`}>{l}</button>
            ))}
          </div>
          <Building2 size={16} className="text-purple-400" />
          <span className="text-sm font-bold text-slate-200">{empresa?.company_name}</span>
        </div>
      </header>

      <main className="p-4 md:p-6 flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ gridTemplateRows: "minmax(0, 1fr)" }}>

        <div className="flex flex-col gap-3 min-h-0 overflow-y-auto scrollbar-hide" style={{ height: alturaColDireita ? `${alturaColDireita}px` : undefined }}>
          <div className="bg-[#0a1424] border border-purple-500/20 rounded-xl p-5 shrink-0">
            <h1 className="text-lg font-black text-slate-100 mb-1.5" style={{ lineHeight: 1.5 }}>{tG.simuladorPlano}</h1>
            <p className="text-sm text-slate-500 mb-4">{tG.escolhaTipo}</p>

            <div className="grid grid-cols-2 gap-2.5 mb-3">
              <button onClick={() => { setTipoHorario("fijo"); const p = planos.find((pl) => pl.tipo_horario === "fijo"); if (p) handleEscolherPlano(p); }} className={`py-2 rounded-lg text-xs font-bold border transition-all ${tipoHorario === "fijo" ? "bg-purple-500/20 border-purple-500/50 text-purple-300" : "bg-white/5 border-white/10 text-slate-400"}`}>
                {tG.horarioFixo}
              </button>
              <button onClick={() => { setTipoHorario("flexible"); const p = planos.find((pl) => pl.tipo_horario === "flexible"); if (p) handleEscolherPlano(p); }} className={`py-3 rounded-lg text-sm font-bold border transition-all ${tipoHorario === "flexible" ? "bg-purple-500/20 border-purple-500/50 text-purple-300" : "bg-white/5 border-white/10 text-slate-400"}`}>
                {tG.horarioLivre}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {planosFiltrados.map((p) => (
                <button key={p.plan_key} onClick={() => handleEscolherPlano(p)} className={`text-left p-3 rounded-lg border transition-all ${simPlano?.plan_key === p.plan_key ? "bg-purple-500/10 border-purple-500/40" : "bg-white/[0.02] border-white/10 hover:border-white/20"}`}>
                  <p className="text-xs font-bold text-slate-200">{traduzirPlano(p.plan_key, p.plan_label)}</p>
                  <p className="text-sm font-black text-purple-400 mt-1">$ {Number(p.price).toLocaleString("es-CO")}</p>
                </button>
              ))}
            </div>

            {simPlano && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-400">{tG.colaboradores}</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSimPessoas((n) => Math.max(0, n - 1))} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-black text-sm">-</button>
                    <span className="text-base font-black text-slate-100 w-6 text-center">{simPessoas}</span>
                    <button onClick={() => { setSimPessoas((n) => n + 1); setMostrarFormAgregar(true); }} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-black text-sm">+</button>
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">{tG.desconto}</span>
                    <span className="text-base font-black text-purple-300">{desconto.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-2.5">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all duration-500" style={{ width: `${progresso}%` }} />
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-400">{tG.totalMensal}</span>
                    <span className="text-lg font-black text-purple-300">$ {Math.round(total).toLocaleString("es-CO")}</span>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-[#0a1424] border border-white/10 rounded-xl p-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{tG.totalAtual}</p>
              {(() => {
                const totalGeral = grupos.reduce((soma, g) => {
                  const plano = planos.find((p) => p.plan_key === g.plan_key);
                  if (!plano || g.membros.length === 0) return soma;
                  const desc = Math.min(descontoConfig.desconto_maximo, (g.membros.length - 1) * descontoConfig.desconto_por_pessoa);
                  return soma + Number(plano.price) * g.membros.length * (1 - desc / 100);
                }, 0);
                return totalGeral > 0 ? (
                  <>
                    <p className="text-xs font-bold text-slate-200">{grupos.filter((g) => g.membros.length > 0).length} {tG.planosAtivos}</p>
                    <p className="text-base font-black text-purple-300 mt-0.5">$ {Math.round(totalGeral).toLocaleString("es-CO")}</p>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">{tG.semPlanos}</p>
                );
              })()}
            </div>
            <div className="bg-[#0a1424] border border-white/10 rounded-xl p-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{tG.ultimoPago}</p>
              {historicoPagos.length > 0 ? (
                <>
                  <p className="text-xs text-slate-400">{new Date(historicoPagos[0].created_at).toLocaleDateString("es-CO")}</p>
                  <p className="text-base font-black text-amber-400 mt-0.5">$ {Number(historicoPagos[0].amount).toLocaleString("es-CO")}</p>
                </>
              ) : (
                <p className="text-sm text-slate-500">{tG.semPagos}</p>
              )}
            </div>
          </div>

          <div className="flex-1"></div>

          {simPlano && (
            <div className="shrink-0 flex gap-2" style={{ paddingBottom: "4px" }}>
              <button
                onClick={() => router.push(`/portal-empresa/planos?plan_key=${simPlano.plan_key}&pessoas=${simPessoas}`)}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-purple-500/30 text-purple-300 font-black py-4 rounded-lg text-xs uppercase tracking-wider transition-all"
              >
                {tG.verMaisDetalhes}
              </button>
              <button
                onClick={() => { if (emailNovo.trim()) { handleAbrirModal(); } else { router.push(`/portal-empresa/pagamento?plan_key=${simPlano.plan_key}&pessoas=${simPessoas}&group_id=${grupoAtual?.id || ''}`); } }}
                className="flex-1 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:brightness-110 text-white font-black py-4 rounded-lg text-xs uppercase tracking-wider transition-all"
              >
                {emailNovo.trim() ? tG.continuar : tG.pagar}
              </button>
            </div>
          )}

          {mostrarPago && simPlano && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setMostrarPago(false)}>
            <div className="bg-[#0a1424] border border-purple-500/30 rounded-2xl p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-black text-slate-100 mb-4">{tG.confirmarPago}</h2>
              {!mostrarOpcoesPagamento ? (
                <button onClick={() => setMostrarOpcoesPagamento(true)} className="w-full bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:brightness-110 text-white font-black py-3 rounded-lg text-xs uppercase tracking-wider transition-all">
                  {tG.verOpcoes}
                </button>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden max-h-[340px]">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 uppercase tracking-wider text-left">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          {tG.cartaoCredito}
                        </div>
                        <p className="text-[8.5px] text-slate-500 text-left pl-3">{tG.gatewaySeguro}</p>
                      </div>
                    </div>

                    <div className="my-2 relative w-10 h-7 rounded-md bg-gradient-to-br from-slate-200 via-slate-400 to-slate-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_2px_4px_rgba(0,0,0,0.4)] overflow-hidden">
                      <div className="absolute inset-1 border border-slate-500/30 rounded grid grid-cols-3 grid-rows-2 opacity-60">
                        <div className="border-r border-b border-slate-600/40"></div>
                        <div className="border-r border-b border-slate-600/40"></div>
                        <div className="border-b border-slate-600/40"></div>
                        <div className="border-r border-slate-600/40"></div>
                        <div className="border-r border-slate-600/40"></div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 text-[10px] bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/60 font-mono text-left">
                      <div className="flex justify-between text-slate-400"><span>{tG.base}:</span><span>$ {Math.round(total).toLocaleString("es-CO")}</span></div>
                      <div className="flex justify-between text-rose-400"><span>{tG.feePasarela}:</span><span>+ $ {Math.round(total * 0.05).toLocaleString("es-CO")}</span></div>
                      <div className="border-t border-slate-800/80 my-0.5"></div>
                      <div className="flex justify-between font-black text-white text-xs"><span>{tG.total_pg}:</span><span>$ {(Math.round(total * 1.05) - centavos).toLocaleString("es-CO")}</span></div>
                    </div>

                    <button
                      onClick={() => handlePagar(Math.round(total * 1.05) - centavos)}
                      disabled={criandoCobranca}
                      className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black py-2 rounded-xl text-[10px] uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer shadow-md text-center disabled:opacity-50"
                    >
                      {tG.pagarViaWompi}
                    </button>
                    <p className="text-[8.5px] text-slate-500/90 font-medium text-center leading-tight mt-1.5 px-1">
                      {tG.notaWompi}
                    </p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden max-h-[340px]">
                    <div className="absolute top-0 right-0 font-bold text-cyan-400 text-slate-950 text-[7px] font-black px-2 py-0.5 rounded-bl uppercase tracking-widest">
                      {tG.ahorraComision}
                    </div>

                    <div className="text-[10px] font-black text-cyan-400 uppercase tracking-wider text-left flex justify-start items-center">
                      <div className="flex items-center justify-start gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span><span>{tG.llaveBreB}</span></div>
                    </div>

                    <div className="mx-auto w-24 h-24 bg-white p-1 rounded-xl flex items-center justify-center border border-cyan-500/20 my-1 shadow-lg relative overflow-hidden">
                      <img
                        src="https://jdppxfokfhqjudwfwckd.supabase.co/storage/v1/object/public/haas-academy/Untitled%20folder/WhatsApp%20Image%202026-06-28%20at%2012.18.16.jpeg"
                        alt="QR Code Oficial Llave Bre-B"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex flex-col gap-1 text-[10px] bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/60 font-mono text-left">
                      <div className="flex justify-between text-slate-400"><span>{tG.base}:</span><span>$ {Math.round(total).toLocaleString("es-CO")}</span></div>
                      <div className="flex justify-between text-emerald-400 font-bold"><span>{tG.comissao}:</span><span>$0 ({tG.gratis})</span></div>
                      <div className="border-t border-slate-800/80 my-0.5"></div>
                      <div className="flex justify-between font-black text-cyan-400 text-xs"><span>{tG.aTransferir}:</span><span>$ {(Math.round(total) - centavos).toLocaleString("es-CO")}</span></div>
                    </div>

                    <p className="text-[8.5px] text-slate-400/90 font-medium text-center leading-tight mt-1 px-1">
                      {tG.atencao}: {tG.notaBreB}
                    </p>
                    <button onClick={() => handlePagar(Math.round(total) - centavos, false)} disabled={criandoCobranca} className="w-full mt-2 bg-white/5 hover:bg-white/10 border border-cyan-500/30 disabled:opacity-50 text-cyan-300 font-black py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all">
                      {tG.jaTransferi}
                    </button>
                  </div>

                  {cobrancaMsg && (
                    <div className="md:col-span-2 flex flex-col gap-2 items-center pt-2">
                      <p className="text-[10px] text-slate-400 text-center">{cobrancaMsg}</p>
                      <a href="https://campus.academiahaas.com/portal-empresa" className="text-[10px] font-bold text-purple-300 hover:text-purple-200 uppercase tracking-wider transition-all">
                        {idioma === "PT" ? "Voltar ao portal" : idioma === "EN" ? "Back to portal" : "Volver al portal"}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
            </div>
          )}

        </div>

        <div ref={colDireitaRef} className="bg-[#0a1424] border border-white/10 border-l-2 border-l-cyan-400 rounded-xl p-4 flex flex-col h-full min-h-0">
          <h2 className="font-bold text-sm text-slate-200 mb-3 shrink-0">{tG.colaboradoresPlano}</h2>

          {!simPlano ? (
            <p className="text-xs text-slate-500">Elige un plan a la izquierda para ver sus colaboradores.</p>
          ) : (
            <>
              {membrosAtuais.length === 0 ? (
                <div className="flex-1 min-h-0">
                  <p className="text-xs text-slate-500 mb-3">{tG.nenhumColaborador}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5 mb-3 flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                  {membrosAtuais.map((m: any, i: number) => {
                    const hoje = new Date(); hoje.setHours(0,0,0,0);
                    const dataVenc = m.corporate_next_due_date ? new Date(m.corporate_next_due_date + "T00:00:00") : null;
                    const pago = m.corporate_payment_status === "paid";
                    const corSelo = !dataVenc
                      ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                      : pago
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                      : dataVenc < hoje
                      ? "bg-rose-500/15 border-rose-500/40 text-rose-400"
                      : "bg-amber-500/15 border-amber-500/40 text-amber-400";
                    const textoSelo = !dataVenc
                      ? (idioma === "PT" ? "Pendente" : idioma === "EN" ? "Pending" : "Pendiente")
                      : dataVenc.toLocaleDateString(idioma === "EN" ? "en-US" : idioma === "PT" ? "pt-BR" : "es-CO");
                    return (
                      <div key={i} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2 shrink-0 gap-2">
                        <span className="text-xs text-slate-300 truncate">{m.name || m.email}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[9px] font-bold px-2 py-1 rounded-md border ${corSelo}`}>{textoSelo}</span>
                          <button onClick={() => abrirPresenca(m.id, m.name || m.email)} className="text-cyan-400 hover:text-cyan-300 text-xs" title="Ver presença">📅</button>
                          <button onClick={() => handleRemoverColaborador(m.email)} disabled={enviando} className="text-rose-400 hover:text-rose-300 text-xs font-bold disabled:opacity-40">✕</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="border-t border-white/10 pt-3 shrink-0">
                {mostrarFormAgregar && (
                  <div className="space-y-2">
                    <input value={nomeNovo} onChange={(e) => setNomeNovo(e.target.value)} placeholder={tG.nomeCompleto} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500" />
                    <select value={idiomaCursoNovo} onChange={(e) => setIdiomaCursoNovo(e.target.value)} className="w-full bg-[#0a1424] border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200">
                      <option value="" className="bg-[#0a1424] text-slate-400">{tG.selecioneIdioma}</option>
                      <option value="portugues" className="bg-[#0a1424] text-slate-200">{idioma === "PT" ? "Português" : idioma === "EN" ? "Portuguese" : "Portugués"}</option>
                      <option value="ingles" className="bg-[#0a1424] text-slate-200">{idioma === "PT" ? "Inglês" : idioma === "EN" ? "English" : "Inglés"}</option>
                      <option value="espanol" className="bg-[#0a1424] text-slate-200">{idioma === "PT" ? "Espanhol" : idioma === "EN" ? "Spanish" : "Español"}</option>
                      <option value="frances" className="bg-[#0a1424] text-slate-200">{idioma === "PT" ? "Francês" : idioma === "EN" ? "French" : "Francés"}</option>
                    </select>
                    <input value={emailNovo} onChange={(e) => setEmailNovo(e.target.value)} placeholder="nuevo@empresa.com" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500" />
                    {tipoHorario === "fijo" && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2 space-y-1.5">
                          <p className="text-[10px] text-slate-500">
                            {tG.selecioneDias} {simPlano?.plan_key === "3x_semana" ? "3" : simPlano?.plan_key === "5x_semana" ? "5" : ""} {tG.dias_label} ({diasSelecionados.length} {tG.diasSelecionados})
                          </p>
                          <div className="grid grid-cols-3 gap-1.5">
                            {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map((dia, idxDia) => {
                              const ativo = diasSelecionados.includes(dia);
                              const diasRequeridos = simPlano?.plan_key === "3x_semana" ? 3 : simPlano?.plan_key === "5x_semana" ? 5 : 99;
                              const limiteAtingido = diasSelecionados.length >= diasRequeridos;
                              return (
                                <button
                                  key={dia}
                                  type="button"
                                  disabled={!ativo && limiteAtingido}
                                  onClick={() => {
                                    const novaLista = ativo ? diasSelecionados.filter((d) => d !== dia) : [...diasSelecionados, dia];
                                    setDiasSelecionados(novaLista);
                                    setDiasClase(novaLista.join(", "));
                                  }}
                                  className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all ${ativo ? "bg-purple-500/20 border-purple-500/50 text-purple-300" : !ativo && limiteAtingido ? "bg-white/[0.02] border-white/5 text-slate-600 cursor-not-allowed" : "bg-white/5 border-white/10 text-slate-400"}`}
                                >
                                  {tG.diasSemana[idxDia]}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <select value={horarioClase} onChange={(e) => setHorarioClase(e.target.value)} className="col-span-2 w-full bg-[#0a1424] border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200">
                          <option value="" className="bg-[#0a1424]">{tG.horario_label}</option>
                          <option value="7:00 AM - 8:00 AM" className="bg-[#0a1424]">7:00 AM - 8:00 AM</option>
                          <option value="8:00 AM - 9:00 AM" className="bg-[#0a1424]">8:00 AM - 9:00 AM</option>
                          <option value="9:00 AM - 10:00 AM" className="bg-[#0a1424]">9:00 AM - 10:00 AM</option>
                          <option value="5:00 PM - 6:00 PM" className="bg-[#0a1424]">5:00 PM - 6:00 PM</option>
                          <option value="6:00 PM - 7:00 PM" className="bg-[#0a1424]">6:00 PM - 7:00 PM</option>
                          <option value="7:00 PM - 8:00 PM" className="bg-[#0a1424]">7:00 PM - 8:00 PM</option>
                          <option value="8:00 PM - 9:00 PM" className="bg-[#0a1424]">8:00 PM - 9:00 PM</option>
                        </select>
                      </div>
                    )}
                    {(() => {
                      const metaQuantidade = Math.max(0, simPessoas - membrosAtuais.length);
                      return (
                        <>
                          <div className="text-[9px] text-slate-500 px-1">
                            {idioma === "PT" ? `Você pode adicionar ${metaQuantidade} pessoa(s) nova(s), de acordo com o total escolhido no simulador.` : idioma === "EN" ? `You can add ${metaQuantidade} new person/people, based on the total chosen in the simulator.` : `Puedes agregar ${metaQuantidade} persona(s) nueva(s), según el total elegido en el simulador.`}
                          </div>
                          {filaColaboradores.length > 0 && (
                            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                              <button onClick={() => setIndiceFila((p) => Math.max(0, p - 1))} disabled={indiceFila === 0} className="text-slate-400 hover:text-white disabled:opacity-30 text-xs">◀</button>
                              <div className="flex-1 text-center">
                                <span className="text-[10px] text-slate-300 font-bold">{filaColaboradores[indiceFila]?.nome}</span>
                                <span className="text-[9px] text-slate-500 block">{filaColaboradores[indiceFila]?.email}</span>
                              </div>
                              <button onClick={() => setIndiceFila((p) => Math.min(filaColaboradores.length - 1, p + 1))} disabled={indiceFila >= filaColaboradores.length - 1} className="text-slate-400 hover:text-white disabled:opacity-30 text-xs">▶</button>
                            </div>
                          )}
                          {metaQuantidade > 0 && (
                            <div className="flex items-center justify-between text-[9px] text-slate-500 px-1">
                              <span>{filaColaboradores.length + 1} / {metaQuantidade} {idioma === "PT" ? "adicionados" : idioma === "EN" ? "added" : "agregados"}</span>
                              {filaColaboradores.length > 0 && (
                                <button onClick={() => removerDaFila(indiceFila)} className="text-rose-400 hover:text-rose-300 font-bold">
                                  {idioma === "PT" ? "Remover atual" : idioma === "EN" ? "Remove current" : "Eliminar actual"}
                                </button>
                              )}
                            </div>
                          )}
                          {metaQuantidade > 0 && filaColaboradores.length + 1 < metaQuantidade && (
                            <button onClick={adicionarMaisAlguem} className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold py-2 rounded-lg text-xs transition-all">
                              {idioma === "PT" ? "+ Adicionar mais alguém" : idioma === "EN" ? "+ Add another person" : "+ Agregar otra persona"}
                            </button>
                          )}
                          {metaQuantidade > 0 && (
                            <button onClick={handleAbrirModal} className="w-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-bold py-2 rounded-lg text-xs transition-all">
                              {tG.revisarEnviar}
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
                {msgAccion && <p className="text-[11px] text-slate-400 mt-2">{msgAccion}</p>}
              </div>
            </>
          )}
        </div>

      </main>

      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-emerald-500 text-slate-950 font-bold text-xs px-5 py-3 rounded-xl shadow-2xl animate-fadeIn">
          {toastMsg}
        </div>
      )}
      {modalPresenca && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setModalPresenca(null)}>
          <div className="bg-[#0a1424] border border-cyan-500/30 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto scrollbar-hide" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-sm font-black text-slate-100 mb-4">{modalPresenca.nome}</h2>
            {carregandoPresenca ? (
              <p className="text-xs text-slate-500">
                {idioma === "PT" ? "Carregando..." : idioma === "EN" ? "Loading..." : "Cargando..."}
              </p>
            ) : diasPresenca.length === 0 ? (
              <p className="text-xs text-slate-500">
                {idioma === "PT" ? "Nenhuma aula registrada ainda." : idioma === "EN" ? "No classes recorded yet." : "Aún no hay clases registradas."}
              </p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {diasPresenca.map((d, i) => {
                  const data = d.data ? new Date(d.data) : null;
                  const cor = d.presente === true ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400" : d.presente === false ? "bg-rose-500/15 border-rose-500/40 text-rose-400" : "bg-slate-700/20 border-slate-600/40 text-slate-400";
                  const texto = d.presente === true ? (idioma === "PT" ? "Presente" : idioma === "EN" ? "Present" : "Presente") : d.presente === false ? (idioma === "PT" ? "Ausente" : idioma === "EN" ? "Absent" : "Ausente") : (idioma === "PT" ? "Sem registro" : idioma === "EN" ? "Not recorded" : "Sin registro");
                  return (
                    <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${cor}`}>
                      <span className="text-xs text-slate-300">{data ? data.toLocaleDateString(idioma === "EN" ? "en-US" : idioma === "PT" ? "pt-BR" : "es-CO") : "-"}</span>
                      <span className="text-[10px] font-bold">{texto}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <button onClick={() => setModalPresenca(null)} className="w-full mt-4 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold py-2 rounded-xl text-xs uppercase tracking-wider transition-all">
              {idioma === "PT" ? "Fechar" : idioma === "EN" ? "Close" : "Cerrar"}
            </button>
          </div>
        </div>
      )}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setModalAberto(false)}>
          <div className="bg-[#0a1424] border border-purple-500/30 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto scrollbar-hide" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-black text-slate-100 mb-1">{idioma === "PT" ? "Revisar convite" : idioma === "EN" ? "Review invitation" : "Revisar invitación"}</h2>
            <p className="text-xs text-slate-500 mb-4">{idioma === "PT" ? "Para" : idioma === "EN" ? "To" : "Para"}: {emailNovo}</p>

            <div className="flex gap-1.5 mb-4">
              {["es", "pt", "en"].map((l) => (
                <button key={l} onClick={() => setIdiomaEmail(l)} className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${idiomaEmail === l ? "bg-purple-500/20 border-purple-500/50 text-purple-300" : "bg-white/5 border-white/10 text-slate-400"}`}>
                  {l === "es" ? (idioma === "PT" ? "Espanhol" : idioma === "EN" ? "Spanish" : "Español") : l === "pt" ? (idioma === "PT" ? "Português" : idioma === "EN" ? "Portuguese" : "Portugués") : (idioma === "PT" ? "Inglês" : idioma === "EN" ? "English" : "Inglés")}
                </button>
              ))}
            </div>

            <div className="bg-gradient-to-br from-slate-300/10 to-purple-500/10 rounded-2xl p-3 mb-4 shadow-inner">
              <div className="bg-white rounded-xl p-3 shadow-lg" dangerouslySetInnerHTML={{ __html: preview }} />
            </div>

            <div className="flex gap-2">
              <button onClick={() => setModalAberto(false)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all">
                {idioma === "PT" ? "Cancelar" : idioma === "EN" ? "Cancel" : "Cancelar"}
              </button>
              <button onClick={handleConfirmarEnvio} disabled={enviando} className="flex-1 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:brightness-110 disabled:opacity-50 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all">
                {enviando ? (idioma === "PT" ? "Enviando..." : idioma === "EN" ? "Sending..." : "Enviando...") : (idioma === "PT" ? "Confirmar e enviar" : idioma === "EN" ? "Confirm and send" : "Confirmar y enviar")}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


export default function GestionarPlan() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0F1D]" />}>
      <GestionarPlanInterno />
    </Suspense>
  );
}
