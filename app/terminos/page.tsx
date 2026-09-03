import Link from "next/link";

export const metadata = {
  title: "Términos de Servicio — VIS IA",
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-8">
        <Link href="/login" className="text-sm text-blue-600 mb-6 inline-block">
          ← Volver
        </Link>
        <h1 className="text-xl font-semibold text-slate-900 mb-1">
          Términos de Servicio
        </h1>
        <p className="text-sm text-slate-400 mb-8">
          VIS IA Federal Consulting LLC — Última actualización: septiembre de 2026
        </p>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <section>
            <h2 className="font-semibold text-slate-900 mb-2">1. Sobre el servicio</h2>
            <p>
              VIS IA es una plataforma de inteligencia empresarial operada por VIS
              IA Federal Consulting LLC ("VIS IA", "nosotros"). Analizamos
              información pública (como reseñas, presencia digital y
              competencia) e información que el cliente nos proporciona
              directamente, para generar un panel de análisis, hallazgos y
              recomendaciones sobre su negocio.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900 mb-2">2. Planes y pagos</h2>
            <p>
              VIS IA ofrece distintos niveles de servicio (Diagnostic, PRO,
              Intelligence), cada uno con su propio alcance, precio y
              frecuencia de facturación, según lo acordado al momento de la
              contratación. Los planes recurrentes se renuevan
              automáticamente salvo cancelación por parte del cliente.
              Diagnostic es un servicio de pago único, no recurrente.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900 mb-2">
              3. Naturaleza de los hallazgos y estimaciones
            </h2>
            <p>
              Los hallazgos, puntajes (incluido el "VIS Score"), pérdidas
              potenciales y oportunidades presentados en el panel son
              análisis basados en la evidencia disponible al momento del
              reporte. Cuando no existe evidencia suficiente para confirmar
              una cifra, VIS IA lo indica explícitamente (por ejemplo, como
              "Estimado", "Potencial" o "No calculable") en vez de presentar
              una cifra exacta como un hecho. Estos análisis son
              orientativos y no constituyen una garantía de resultados,
              ingresos, ni de que las acciones recomendadas produzcan un
              resultado específico.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900 mb-2">
              4. Responsabilidades del cliente
            </h2>
            <p>
              El cliente es responsable de la veracidad de la información
              que proporciona a través del panel (incluyendo las respuestas
              al cuestionario interno), de mantener la confidencialidad de
              sus credenciales de acceso, y de tomar sus propias decisiones
              de negocio — VIS IA provee información e inteligencia, no
              asesoría legal, financiera o contable.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900 mb-2">
              5. Limitación de responsabilidad
            </h2>
            <p>
              En la máxima medida permitida por la ley, VIS IA Federal
              Consulting LLC no será responsable por decisiones de negocio
              tomadas con base en el panel, ni por pérdidas indirectas,
              incidentales o consecuentes derivadas del uso del servicio.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900 mb-2">6. Cancelación</h2>
            <p>
              El cliente puede solicitar la cancelación de un plan
              recurrente en cualquier momento, contactando a VIS IA. La
              cancelación aplica al siguiente ciclo de facturación, salvo
              que se acuerde lo contrario.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900 mb-2">7. Cambios a estos términos</h2>
            <p>
              VIS IA puede actualizar estos términos ocasionalmente. Los
              cambios se reflejarán con una nueva fecha de "última
              actualización" en esta página.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900 mb-2">8. Contacto</h2>
            <p>
              Para preguntas sobre estos términos, escríbenos por WhatsApp
              al +1 678 400 7344.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
