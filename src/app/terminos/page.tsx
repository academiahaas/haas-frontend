import React from "react";

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-[#0b1528] text-slate-300 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-cyan-500/30">
      <div className="max-w-3xl mx-auto bg-[#111927] border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl shadow-cyan-900/10">
        
        <div className="border-b border-white/10 pb-6 mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-cyan-400 uppercase tracking-wider">
            Términos de Servicio
          </h1>
          <p className="text-sm text-slate-500 mt-2">Última actualización: Agosto de 2026</p>
        </div>

        <div className="space-y-8 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">1</span>
              Naturaleza del Servicio y Modelo Educativo
            </h2>
            <p className="mb-2">
              Somos una institución licenciada para la enseñanza de idiomas. Nuestros programas están estructurados de manera rigurosa bajo los lineamientos del <strong>Marco Común Europeo de Referencia para las Lenguas (MCER)</strong>.
            </p>
            <p>
              Nuestro modelo es completamente flexible y orientado al alumno. <strong>No exigimos cláusulas de permanencia ni contratos a largo plazo.</strong> El servicio se presta única y exclusivamente mediante la adquisición de créditos o paquetes mensuales.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">2</span>
              Sistema de Créditos y Vigencia
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li>El estudiante adquiere créditos que le otorgan el derecho a programar y recibir clases durante un periodo determinado.</li>
              <li>Los créditos o clases que no sean utilizados dentro del periodo de vigencia establecido <strong>no se acumulan</strong> para meses o periodos posteriores, y no son reembolsables.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">3</span>
              Políticas de Agendamiento, Cancelación y Reposición
            </h2>
            <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl mt-3 space-y-4">
              <p><strong>Agendamiento:</strong> Las clases deben programarse a través de la plataforma con un mínimo de <strong>24 horas de antelación</strong>.</p>
              <p><strong>Cancelación:</strong> Si no puedes asistir, debes cancelar la sesión con un mínimo de <strong>12 horas de antelación</strong>.</p>
              <p><strong>Reposición:</strong> Si cancelas cumpliendo el tiempo estipulado, el crédito regresará a tu cuenta. Tendrás un plazo máximo de <strong>10 días calendario</strong> para utilizarlo antes de que expire.</p>
              <p className="text-red-400/90 text-sm">
                * Importante: La cancelación fuera de tiempo o la inasistencia resultará en el descuento automático del crédito sin derecho a reposición.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">4</span>
              Certificaciones Académicas
            </h2>
            <p>
              Otorgamos certificaciones formales que avalan tu progreso. Estos certificados se emiten basándose estrictamente en las <strong>horas de trabajo acumuladas</strong> y tras la culminación satisfactoria de cada nivel del MCER.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}
