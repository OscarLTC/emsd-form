import { Layout } from '../../../shared/components/Layout';
import { OrderForm } from '../components/OrderForm';

export function OrderFormPage() {
  return (
    <Layout title="Registrar pedido">
      <OrderForm />
    </Layout>
  );
}
