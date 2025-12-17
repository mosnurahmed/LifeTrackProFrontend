/**
 * Add/Edit Bazar List Modal
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import {
  useCreateList,
  useUpdateList,
  useBazarList,
} from '../../../hooks/api/useBazar';
import { Button, Input, Spinner } from '../../../components/common';
import { bazarListSchema } from '../../../utils/validation/schemas';

const AddBazarListModal: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, textStyles, spacing, borderRadius } = useTheme();

  const { mode, listId } = (route.params as any) || { mode: 'create' };
  const isEditMode = mode === 'edit';

  const { data: list, isLoading: listLoading } = useBazarList(listId);
  const createMutation = useCreateList();
  const updateMutation = useUpdateList();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(bazarListSchema),
    defaultValues: {
      title: '',
      description: '',
      totalBudget: undefined,
    },
  });

  useEffect(() => {
    if (isEditMode && list?.data) {
      setValue('title', list.data.title);
      setValue('description', list.data.description || '');
      setValue('totalBudget', list.data.totalBudget);
    }
  }, [list, isEditMode]);

  const onSubmit = async (data: any) => {
    const formattedData = {
      ...data,
      totalBudget: data.totalBudget ? parseFloat(data.totalBudget) : undefined,
    };

    if (isEditMode) {
      await updateMutation.mutateAsync({ id: listId, data: formattedData });
    } else {
      await createMutation.mutateAsync(formattedData);
    }
    navigation.goBack();
  };

  const styles = createStyles(colors, textStyles, spacing, borderRadius);

  if (listLoading) {
    return (
      <View style={styles.container}>
        <Spinner text="Loading..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={28} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {isEditMode ? 'Edit Shopping List' : 'New Shopping List'}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Title */}
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

        {/* Description */}
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Description (Optional)"
              placeholder="Add notes about this list"
              value={value}
              onChangeText={onChange}
              type="multiline"
              leftIcon="text-outline"
            />
          )}
        />

        {/* Budget */}
        <Controller
          control={control}
          name="totalBudget"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Budget (Optional)"
              placeholder="0"
              type="number"
              value={value?.toString()}
              onChangeText={text =>
                onChange(text ? parseFloat(text) : undefined)
              }
              leftIcon="cash-outline"
            />
          )}
        />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          variant="outline"
          onPress={() => navigation.goBack()}
          style={{ flex: 1, marginRight: spacing.sm }}
        >
          Cancel
        </Button>
        <Button
          onPress={handleSubmit(onSubmit)}
          loading={createMutation.isPending || updateMutation.isPending}
          style={{ flex: 1, marginLeft: spacing.sm }}
        >
          {isEditMode ? 'Update' : 'Create'}
        </Button>
      </View>
    </View>
  );
};

const createStyles = (
  colors: any,
  textStyles: any,
  spacing: any,
  borderRadius: any,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      ...textStyles.h3,
      color: colors.text.primary,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
    },
    footer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
  });

export default AddBazarListModal;
