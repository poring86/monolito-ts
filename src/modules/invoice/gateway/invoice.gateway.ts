import { Invoice } from "../domain/invoice.entity";

export interface InvoiceGateway {
  find(id: string): Promise<Invoice>;
  add(invoice: Invoice): Promise<Invoice>;
}
