import { Statistics } from "../models";
import { StatisticsRepository } from "../repositories";

export class StatisticsService {
  constructor(private readonly statisticsRepository: StatisticsRepository) {}

  public getStatistics(): Statistics {
    return this.statisticsRepository.get();
  }

  public updateAfterOrder(params: {
    orderTotal: number;
    itemCount: number;
    discountAmount: number;
    generatedCoupon: boolean;
  }): Statistics {
    const statistics = this.statisticsRepository.get();

    const updated: Statistics = {
      totalOrders: statistics.totalOrders + 1,
      revenue: this.toMoney(statistics.revenue + params.orderTotal),
      itemsPurchased: statistics.itemsPurchased + params.itemCount,
      discountCodesGenerated:
        statistics.discountCodesGenerated + (params.generatedCoupon ? 1 : 0),
      totalDiscountsGiven: this.toMoney(
        statistics.totalDiscountsGiven + params.discountAmount,
      ),
    };

    this.statisticsRepository.save(updated);
    return updated;
  }

  public incrementCouponsGenerated(): Statistics {
    const statistics = this.statisticsRepository.get();
    const updated: Statistics = {
      ...statistics,
      discountCodesGenerated: statistics.discountCodesGenerated + 1,
    };
    this.statisticsRepository.save(updated);
    return updated;
  }

  private toMoney(value: number): number {
    return Number(value.toFixed(2));
  }
}
