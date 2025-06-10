import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardApi } from "@/lib/api";
import { Package, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    queryFn: () => dashboardApi.getMetrics(),
  });

  const { data: recentTransactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/dashboard/recent-transactions"],
    queryFn: () => dashboardApi.getRecentTransactions(5),
  });

  const { data: lowStockProducts, isLoading: lowStockLoading } = useQuery({
    queryKey: ["/api/dashboard/low-stock"],
    queryFn: () => dashboardApi.getLowStockProducts(),
  });

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">Overview of your warehouse inventory</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                    <Package className="text-primary w-4 h-4" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div>
                    <div className="text-sm font-medium text-slate-500 truncate">Total Products</div>
                    {metricsLoading ? (
                      <Skeleton className="h-6 w-16 mt-1" />
                    ) : (
                      <div className="text-lg font-semibold text-slate-900">{metrics?.totalProducts || 0}</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-green-600 w-4 h-4" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div>
                    <div className="text-sm font-medium text-slate-500 truncate">Stock In (Today)</div>
                    {metricsLoading ? (
                      <Skeleton className="h-6 w-16 mt-1" />
                    ) : (
                      <div className="text-lg font-semibold text-slate-900">{metrics?.stockInToday || 0}</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                    <TrendingDown className="text-red-600 w-4 h-4" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div>
                    <div className="text-sm font-medium text-slate-500 truncate">Stock Out (Today)</div>
                    {metricsLoading ? (
                      <Skeleton className="h-6 w-16 mt-1" />
                    ) : (
                      <div className="text-lg font-semibold text-slate-900">{metrics?.stockOutToday || 0}</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="text-amber-600 w-4 h-4" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div>
                    <div className="text-sm font-medium text-slate-500 truncate">Low Stock Items</div>
                    {metricsLoading ? (
                      <Skeleton className="h-6 w-16 mt-1" />
                    ) : (
                      <div className="text-lg font-semibold text-slate-900">{metrics?.lowStockItems || 0}</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between py-3">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-8" />
                    </div>
                  ))}
                </div>
              ) : recentTransactions?.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Package className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                  <p>No recent transactions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTransactions?.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          transaction.type === 'IN' ? 'bg-green-50' : 'bg-red-50'
                        }`}>
                          {transaction.type === 'IN' ? (
                            <TrendingUp className="text-green-600 w-4 h-4" />
                          ) : (
                            <TrendingDown className="text-red-600 w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{transaction.productName}</p>
                          <p className="text-xs text-slate-500">
                            {formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${
                          transaction.type === 'IN' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'IN' ? '+' : '-'}{transaction.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alert</CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between py-3">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : lowStockProducts?.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <AlertTriangle className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                  <p>No low stock items</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lowStockProducts?.map((product) => (
                    <div key={product.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-500">SKU: {product.sku}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={product.currentStock === 0 ? "destructive" : "secondary"} className={
                          product.currentStock === 0 ? "danger-bg" : "warning-bg"
                        }>
                          {product.currentStock} left
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
