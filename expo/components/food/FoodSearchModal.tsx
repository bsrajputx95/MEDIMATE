import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { X, Search, Utensils, Plus, Check } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '@/constants/design-tokens';
import { API_BASE_URL } from '@/constants/api';

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
}

interface FoodSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectFood: (food: FoodItem) => void;
}

// Common foods database for offline fallback
const COMMON_FOODS: FoodItem[] = [
  { id: '1', name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6, servingSize: '100g' },
  { id: '2', name: 'Brown Rice (1 cup)', calories: 216, protein: 5, carbs: 45, fat: 1.8, servingSize: '1 cup cooked' },
  { id: '3', name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, servingSize: '1 medium' },
  { id: '4', name: 'Egg', calories: 78, protein: 6, carbs: 0.6, fat: 5, servingSize: '1 large' },
  { id: '5', name: 'Greek Yogurt (1 cup)', calories: 100, protein: 17, carbs: 6, fat: 0.7, servingSize: '1 cup' },
  { id: '6', name: 'Oatmeal (1 cup)', calories: 158, protein: 6, carbs: 27, fat: 3.2, servingSize: '1 cup cooked' },
  { id: '7', name: 'Salmon (100g)', calories: 208, protein: 20, carbs: 0, fat: 13, servingSize: '100g' },
  { id: '8', name: 'Broccoli (1 cup)', calories: 55, protein: 3.7, carbs: 11, fat: 0.6, servingSize: '1 cup' },
  { id: '9', name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, servingSize: '1 medium' },
  { id: '10', name: 'Almonds (1 oz)', calories: 164, protein: 6, carbs: 6, fat: 14, servingSize: '1 oz (28g)' },
  { id: '11', name: 'Sweet Potato (1 medium)', calories: 103, protein: 2.3, carbs: 24, fat: 0.1, servingSize: '1 medium' },
  { id: '12', name: 'Avocado (1/2)', calories: 161, protein: 2, carbs: 9, fat: 15, servingSize: '1/2 medium' },
  { id: '13', name: 'Spinach (1 cup raw)', calories: 7, protein: 0.9, carbs: 1.1, fat: 0.1, servingSize: '1 cup' },
  { id: '14', name: 'Whole Wheat Bread (1 slice)', calories: 81, protein: 4, carbs: 14, fat: 1.1, servingSize: '1 slice' },
  { id: '15', name: 'Milk (1 cup)', calories: 149, protein: 8, carbs: 12, fat: 8, servingSize: '1 cup' },
];

export const FoodSearchModal: React.FC<FoodSearchModalProps> = ({
  visible,
  onClose,
  onSelectFood,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  // Search foods - local fallback with API option
  const searchFoods = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      // Try API first
      const response = await fetch(`${API_BASE_URL}/api/food/search?q=${encodeURIComponent(query)}`);
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.foods || []);
      } else {
        // Fallback to local search
        const localResults = COMMON_FOODS.filter(food =>
          food.name.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(localResults);
      }
    } catch (error) {
      // Fallback to local search on error
      const localResults = COMMON_FOODS.filter(food =>
        food.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(localResults);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchFoods(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchFoods]);

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
  };

  const handleConfirmSelection = () => {
    if (selectedFood) {
      // Add to recent searches
      if (!recentSearches.includes(selectedFood.name)) {
        setRecentSearches(prev => [selectedFood.name, ...prev.slice(0, 4)]);
      }
      
      onSelectFood(selectedFood);
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedFood(null);
    onClose();
  };

  const renderFoodItem = ({ item }: { item: FoodItem }) => {
    const isSelected = selectedFood?.id === item.id;

    return (
      <TouchableOpacity
        style={[styles.foodItem, isSelected && styles.foodItemSelected]}
        onPress={() => handleSelectFood(item)}
        activeOpacity={0.7}
      >
        <View style={styles.foodIcon}>
          <Utensils size={20} color={isSelected ? COLORS.primary : COLORS.textSecondary} />
        </View>
        <View style={styles.foodInfo}>
          <Text style={[styles.foodName, isSelected && styles.foodNameSelected]}>
            {item.name}
          </Text>
          <Text style={styles.foodServing}>{item.servingSize}</Text>
          <View style={styles.nutritionRow}>
            <Text style={styles.nutritionText}>{item.calories} cal</Text>
            <Text style={styles.nutritionDot}>•</Text>
            <Text style={styles.nutritionText}>P: {item.protein}g</Text>
            <Text style={styles.nutritionDot}>•</Text>
            <Text style={styles.nutritionText}>C: {item.carbs}g</Text>
            <Text style={styles.nutritionDot}>•</Text>
            <Text style={styles.nutritionText}>F: {item.fat}g</Text>
          </View>
        </View>
        {isSelected && (
          <View style={styles.checkIcon}>
            <Check size={18} color={COLORS.textInverse} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderRecentSearch = (search: string) => (
    <TouchableOpacity
      key={search}
      style={styles.recentSearchChip}
      onPress={() => setSearchQuery(search)}
    >
      <Text style={styles.recentSearchText}>{search}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Search Foods</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <X size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Search size={20} color={COLORS.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for a food..."
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Recent Searches */}
          {!searchQuery && recentSearches.length > 0 && (
            <View style={styles.recentSearchesContainer}>
              <Text style={styles.recentSearchesTitle}>Recent Searches</Text>
              <View style={styles.recentSearchesList}>
                {recentSearches.map(renderRecentSearch)}
              </View>
            </View>
          )}

          {/* Search Results */}
          <FlatList
            data={searchQuery ? searchResults : COMMON_FOODS}
            renderItem={renderFoodItem}
            keyExtractor={item => item.id}
            style={styles.resultsList}
            contentContainerStyle={styles.resultsContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              isSearching ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.loadingText}>Searching...</Text>
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Utensils size={48} color={COLORS.textMuted} />
                  <Text style={styles.emptyText}>No foods found</Text>
                  <Text style={styles.emptySubtext}>Try a different search term</Text>
                </View>
              )
            }
          />

          {/* Footer */}
          {selectedFood && (
            <View style={styles.footer}>
              <View style={styles.selectedPreview}>
                <Text style={styles.selectedName}>{selectedFood.name}</Text>
                <Text style={styles.selectedCalories}>{selectedFood.calories} calories</Text>
              </View>
              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmSelection}>
                <Plus size={20} color={COLORS.textInverse} />
                <Text style={styles.confirmButtonText}>Add Food</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'],
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  searchContainer: {
    padding: SPACING['2xl'],
    paddingBottom: SPACING.lg,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderMuted,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    marginLeft: SPACING.md,
  },
  recentSearchesContainer: {
    paddingHorizontal: SPACING['2xl'],
    paddingBottom: SPACING.lg,
  },
  recentSearchesTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  recentSearchesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  recentSearchChip: {
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  recentSearchText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  resultsList: {
    flex: 1,
  },
  resultsContent: {
    padding: SPACING['2xl'],
    paddingTop: 0,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  foodItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  foodIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  foodNameSelected: {
    color: COLORS.primary,
  },
  foodServing: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  nutritionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  nutritionText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHTS.medium,
  },
  nutritionDot: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  checkIcon: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SPACING['3xl'],
  },
  loadingText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING['3xl'],
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING['2xl'],
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  selectedPreview: {
    flex: 1,
  },
  selectedName: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  selectedCalories: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  confirmButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textInverse,
  },
});

export default FoodSearchModal;
