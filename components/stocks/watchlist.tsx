"use client";

import { useState } from "react";
import {
  Star,
  StarOff,
  Plus,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Mock watchlist data
const initialWatchlistData = [
  {
    id: "1",
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 175.5,
    change: 2.34,
    changePercent: 1.35,
    isFavorite: true,
  },
  {
    id: "2",
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 378.92,
    change: 4.67,
    changePercent: 1.23,
    isFavorite: true,
  },
  {
    id: "3",
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 142.65,
    change: 1.89,
    changePercent: 1.34,
    isFavorite: false,
  },
  {
    id: "4",
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 178.23,
    change: -1.45,
    changePercent: -0.81,
    isFavorite: false,
  },
  {
    id: "5",
    symbol: "TSLA",
    name: "Tesla, Inc.",
    price: 245.67,
    change: 5.78,
    changePercent: 2.41,
    isFavorite: true,
  },
  {
    id: "6",
    symbol: "META",
    name: "Meta Platforms, Inc.",
    price: 467.89,
    change: -2.34,
    changePercent: -0.5,
    isFavorite: false,
  },
  {
    id: "7",
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    price: 487.21,
    change: 16.78,
    changePercent: 3.45,
    isFavorite: true,
  },
];

export function Watchlist() {
  const [watchlistData, setWatchlistData] = useState(initialWatchlistData);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSymbol, setNewSymbol] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Toggle favorite status
  const toggleFavorite = (id: string) => {
    setWatchlistData(
      watchlistData.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  // Add new symbol to watchlist
  const addToWatchlist = () => {
    if (!newSymbol) return;

    const newItem = {
      id: `${watchlistData.length + 1}`,
      symbol: newSymbol.toUpperCase(),
      name: `${newSymbol.toUpperCase()} Stock`,
      price: Math.floor(Math.random() * 500) + 50,
      change: Math.random() * 10 - 5,
      changePercent: Math.random() * 5 - 2.5,
      isFavorite: false,
    };

    setWatchlistData([...watchlistData, newItem]);
    setNewSymbol("");
    setIsAddDialogOpen(false);
  };

  // Remove from watchlist
  const removeFromWatchlist = (id: string) => {
    setWatchlistData(watchlistData.filter((item) => item.id !== id));
  };

  // Filter watchlist based on favorites toggle
  const filteredWatchlist = showFavoritesOnly
    ? watchlistData.filter((item) => item.isFavorite)
    : watchlistData;

  return (
    <div>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Button
            variant={showFavoritesOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            {showFavoritesOnly ? (
              <Star className="h-4 w-4 mr-1" />
            ) : (
              <StarOff className="h-4 w-4 mr-1" />
            )}
            {showFavoritesOnly ? "Favorites" : "All Symbols"}
          </Button>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Symbol
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add to Watchlist</DialogTitle>
              <DialogDescription>
                Enter a stock symbol to add to your watchlist.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="symbol" className="text-right">
                  Symbol
                </Label>
                <Input
                  id="symbol"
                  placeholder="e.g., AAPL"
                  className="col-span-3"
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={addToWatchlist}>Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="divide-y">
        {filteredWatchlist.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 hover:bg-accent/50"
          >
            <div className="flex items-center space-x-2">
              <button
                onClick={() => toggleFavorite(item.id)}
                className={`text-${
                  item.isFavorite ? "yellow-500" : "muted-foreground"
                }`}
              >
                <Star
                  className={`h-4 w-4 ${
                    item.isFavorite
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
              <div>
                <div className="font-medium">{item.symbol}</div>
                <div className="text-xs text-muted-foreground">{item.name}</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div>${item.price.toFixed(2)}</div>
                <div
                  className={`text-xs ${
                    item.change >= 0 ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  {item.change >= 0 ? "+" : ""}
                  {item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => toggleFavorite(item.id)}>
                      {item.isFavorite
                        ? "Remove from Favorites"
                        : "Add to Favorites"}
                    </DropdownMenuItem>
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Set Alert</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-rose-500"
                      onClick={() => removeFromWatchlist(item.id)}
                    >
                      Remove from Watchlist
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredWatchlist.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="text-muted-foreground mb-2">
            No stocks in your watchlist
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Symbol
          </Button>
        </div>
      )}
    </div>
  );
}
