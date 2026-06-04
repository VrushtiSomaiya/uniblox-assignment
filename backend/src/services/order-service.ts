import { DeliveryStatus, DELIVERY_STATUSES, Order } from "../models";
import { OrderRepository } from "../repositories";
import { ServiceError } from "./errors";

export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  public listOrders(): Order[] {
    return this.orderRepository
      .list()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  public updateDeliveryStatus(
    orderId: string,
    deliveryStatus: DeliveryStatus,
  ): Order {
    const order = this.orderRepository.getById(orderId);
    if (!order) {
      throw new ServiceError("ORDER_NOT_FOUND", "Order not found.", 404);
    }

    if (!DELIVERY_STATUSES.includes(deliveryStatus)) {
      throw new ServiceError(
        "INVALID_DELIVERY_STATUS",
        "deliveryStatus must be pending, out_for_shipment, or delivered.",
      );
    }

    order.deliveryStatus = deliveryStatus;
    this.orderRepository.save(order);
    return order;
  }
}
