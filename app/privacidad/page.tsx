import Link from "next/link";

export const metadata = {
  title: "Política de Privacidad — VIS IA",
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-8">
        <Link href="/login" className="text-sm text-blue-600 mb-6 inline-block">
          ← Volver
        </Link>
        <h1 className="text-xl font-semibold text-slate-900 mb-1">
          Política de Privacidad
        </h1>
        <p className="text-sm text-slate-400 mb-8">
          VIS IA Federal Consulting LLC — Última actualización: septiembre de 2026
        </p>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <section>
            <h2 className="font-semibold text-slate-900 mb-2">
              1. Qué información recopilamos
            </h2>
            <p>
              Recopilamos: (a) datos que el negocio nos proporciona
              directamente (nombre del negocio, ubicación, respuestas al
              cuestionario interno de 15 preguntas); (b) información pública
              sobre el negocio disponible en internet (reseñas, calificación
              en Google y otras plataformas, presencia digital,
              competencia); y (c) datos básicos de la cuenta de acceso
              (correo electrónico) a través de nuestro proveedor de
              autenticación.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900 mb-2">
              2. Cómo usamos la información
            </h2>
            <p>
              Usamos esta información exclusivamente para generar el
              análisis, los reportes y las recomendaciones que se muestran
              en el panel del negocio, para dar seguimiento a su evolución
              en el tiempo, y para comunicarnos con el negocio sobre su
              cuenta. No vendemos ni compartimos esta información con
              terceros con fines publicitarios.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900 mb-2">
              3. Dónde se almacena la información
            </h2>
            <p>
              Los datos se almacenan en Supabase (base de datos) y la
              aplicación se aloja en Vercel, ambos proveedores de
              infraestructura con sus propias medidas de seguridad. El
              acceso a los datos de cada negocio está restringido: cada
              cuenta solo puede ver su propia información, nunca la de
              otro cliente.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900 mb-2">4. Con quién compartimos datos</h2>
            <p>
              No compartimos la información del negocio con terceros, salvo
              cuando sea necesario para operar el servicio (por ejemplo,
              proveedores de infraestructura como Supabase y Vercel) o
              cuando la ley lo requiera.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900 mb-2">5. Cuánto tiempo conservamos los datos</h2>
            <p>
              Conservamos la información mientras la cuenta esté activa. Si
              el negocio solicita la eliminación de su cuenta y datos,
              procederemos a eliminarlos en un plazo razonable, salvo
              obligación legal de conservarlos por más tiempo.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900 mb-2">6. Tus derechos</h2>
            <p>
              El negocio puede solicitar en cualquier momento: acceso a sus
              datos, corrección de información incorrecta, o eliminación de
              su cuenta y datos asociados, contactando a VIS IA.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900 mb-2">7. Contacto</h2>
            <p>
              Para preguntas sobre esta política o para ejercer tus
              derechos sobre tus datos, escríbenos por WhatsApp al
              +1 678 400 7344.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
