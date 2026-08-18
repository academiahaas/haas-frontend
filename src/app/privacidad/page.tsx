import React from "react";

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-[#0b1528] text-slate-300 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-cyan-500/30">
      <div className="max-w-3xl mx-auto bg-[#111927] border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl shadow-cyan-900/10">
        
        <div className="border-b border-white/10 pb-6 mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-cyan-400 uppercase tracking-wider">
            Política de Privacidad
          </h1>
          <p className="text-sm text-slate-500 mt-2">Tratamiento de Datos Personales (Colombia)</p>
        </div>

        <div className="space-y-8 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-white mb-3">1. Marco Legal y Compromiso</h2>
            <p>
              En estricto cumplimiento de la <strong>Ley 1581 de 2012 (Ley de Protección de Datos Personales o Hábeas Data)</strong> y el Decreto 1377 de 2013 de la República de Colombia, Academia Haas garantiza el derecho constitucional de todos nuestros estudiantes y usuarios a conocer, actualizar y rectificar la información que se haya recogido sobre ellos en nuestras bases de datos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. Información Recopilada y Finalidad</h2>
            <p className="mb-2">Recopilamos datos estrictamente necesarios para la prestación del servicio educativo, tales como:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 mb-4">
              <li>Nombres y apellidos.</li>
              <li>Documento de identidad.</li>
              <li>Correo electrónico y número de contacto (WhatsApp).</li>
              <li>Historial de uso de créditos y progreso académico.</li>
            </ul>
            <p>
              <strong>Uso de los datos:</strong> Utilizamos esta información exclusivamente para la gestión de créditos, agendamiento de clases, envío de material de apoyo, seguimiento pedagógico y emisión de certificados académicos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. Derechos del Titular de los Datos</h2>
            <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl mt-3">
              <p className="mb-3">Como estudiante y titular de la información, tienes derecho en todo momento a:</p>
              <ul className="list-disc pl-5 space-y-2 text-slate-400">
                <li><strong>Conocer, actualizar y rectificar</strong> tus datos personales frente a la institución.</li>
                <li><strong>Solicitar prueba</strong> de la autorización otorgada para el tratamiento de datos.</li>
                <li><strong>Ser informado</strong>, previa solicitud, sobre el uso que se le ha dado a tus datos.</li>
                <li><strong>Revocar la autorización</strong> y/o solicitar la supresión del dato cuando consideres que no se han respetado los principios y garantías legales.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">4. Seguridad y Confidencialidad</h2>
            <p>
              Nos comprometemos a proteger la información de nuestros usuarios mediante estrictos protocolos de seguridad técnica y administrativa. <strong>Tus datos no serán vendidos, cedidos ni compartidos con terceros</strong> con fines comerciales sin tu consentimiento previo, expreso e informado.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}
