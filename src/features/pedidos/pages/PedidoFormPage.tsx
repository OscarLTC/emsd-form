import { Layout } from '../../../shared/components/Layout';
import { PedidoForm } from '../components/PedidoForm';

export function PedidoFormPage() {
  return (
    <Layout titulo="Registrar pedido">
      <PedidoForm />
    </Layout>
  );
}
