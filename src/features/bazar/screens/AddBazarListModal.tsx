/**
 * Add/Edit Bazar List Modal — Professional Minimal
 */

import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import { useCreateList, useUpdateList, useBazarList } from '../../../hooks/api/useBazar';
import { Button, Input, SafeScreen, Spinner } from '../../../components/common';
import { bazarListSchema } from '../../../utils/validation/schemas';

const AddBazarListModal: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, isDark } = useTheme();

  const { mode, listId } = (route.params as any) || { mode: 'create' };
  const isEditMode = mode === 'edit';

  const { data: list, isLoading: listLoading } = useBazarList(listId);
  const createMutation = useCreateList();
  const updateMutation = useUpdateList();

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const borderC = isDark ? '#334155' : '#E2E8F0';

  const {
    control, handleSubmit, setValue, formState: { errors },
  } = useForm({
    resolver: yupResolver(bazarListSchema),
    defaultValues: { title: '', description: '', totalBudget: undefined },
  });

  useEffect(() => {
    if (isEditMode && list?.data) {
      setValue('title', list.data.title);
      setValue('description', list.data.description || '');
      setValue('totalBudget', list.data.totalBudget);
    }
  }, [list, isEditMode]);

  const onSubmit = async (data: any) => {
    const formatted = {
      ...data,
      totalBudget: data.totalBudget ? parseFloat(data.totalBudget) : undefined,
    };
    if (isEditMode) {
      await updateMutation.mutateAsync({ id: listId, data: formatted });
    } else {
      await createMutation.mutateAsync(formatted);
    }
    navigation.goBack();
  };

  if (listLoading) {
    return (
      <SafeScreen>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Spinner text="Loading..." />
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: borderC }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="close" size={22} color={textPri} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textPri }]}>
            {isEditMode ? 'Edit List' : 'New List'}
          </Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <Input
                label="List Title *"
                placeholder="e.g., Weekly Groceries"
                value={value}
                onChangeText={onChange}
                error={errors.title?.message}
                leftIcon="cart-outline"
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Description"
                placeholder="Add notes about this list"
                value={value}
                onChangeText={onChange}
                type="multiline"
                leftIcon="text-outline"
              />
            )}
          />

          <Controller
            control={control}
            name="totalBudget"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Budget"
                placeholder="0"
                type="number"
                value={value?.toString()}
                onChangeText={text => onChange(text ? parseFloat(text) : undefined)}
                leftIcon="cash-outline"
              />
            )}
          />
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: borderC }]}>
          <Button
            variant="outline"
            onPress={() => navigation.goBack()}
            style={{ flex: 1, marginRight: 6 }}
          >
            Cancel
          </Button>
          <Button
            onPress={handleSubmit(onSubmit)}
            loading={createMutation.isPending || updateMutation.isPending}
            style={{ flex: 1, marginLeft: 6 }}
          >
            {isEditMode ? 'Update' : 'Create'}
          </Button>
        </View>
      </View>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 14 },
  footer: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1,
  },
});

export default AddBazarListModal;
