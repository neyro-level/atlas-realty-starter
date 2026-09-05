import type { CollectionConfig } from 'payload'

import { canCreateEmployees, canDeleteEmployees, canReadEmployees, canUpdateEmployees } from '../access/employees'
import { capabilityFieldAccess, superAdminFieldAccess } from '../access/capabilities'
import {
  EMPLOYEE_SECTION_LABELS,
  EMPLOYEE_SECTIONS,
  EMPLOYEE_STATUS_LABELS,
  EMPLOYEE_STATUSES,
  ENTITY_ORIGIN_LABELS,
  ENTITY_ORIGINS,
} from '../constants'
import { protectEmployeeMutation, recordEmployeeActivity } from '@/core/data-access/system/business-hooks'

export const Employees = {
  slug: 'employees',
  labels: {
    plural: { en: 'Employees', ru: 'Сотрудники' },
    singular: { en: 'Employee', ru: 'Сотрудник' },
  },
  access: {
    create: canCreateEmployees,
    delete: canDeleteEmployees,
    read: canReadEmployees,
    update: canUpdateEmployees,
  },
  admin: {
    defaultColumns: ['fullName', 'origin', 'status', 'teamSection', 'isPublic', 'updatedAt'],
    group: { en: 'Cabinet', ru: 'Кабинет' },
    listSearchableFields: ['fullName', 'publicName', 'phone', 'email'],
    useAsTitle: 'fullName',
  },
  fields: [
    { name: 'fullName', type: 'text', label: { en: 'Full name', ru: 'ФИО' }, required: true },
    { name: 'publicName', type: 'text', label: { en: 'Public name', ru: 'Имя в публичном профиле' } },
    {
      name: 'origin',
      type: 'select',
      access: { update: superAdminFieldAccess() },
      index: true,
      admin: { position: 'sidebar' },
      defaultValue: 'MANUAL',
      label: { en: 'Origin', ru: 'Источник записи' },
      options: ENTITY_ORIGINS.map((origin) => ({ label: ENTITY_ORIGIN_LABELS[origin], value: origin })),
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      index: true,
      admin: { position: 'sidebar' },
      defaultValue: 'active',
      label: { en: 'Status', ru: 'Статус' },
      options: EMPLOYEE_STATUSES.map((status) => ({ label: EMPLOYEE_STATUS_LABELS[status], value: status })),
      required: true,
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      access: { update: capabilityFieldAccess('employee.updatePublicProfile') },
      admin: { position: 'sidebar' },
      defaultValue: false,
      index: true,
      label: { en: 'Visible on site', ru: 'Показывать на сайте' },
    },
    {
      name: 'teamSection',
      type: 'select',
      index: true,
      label: { en: 'Team section', ru: 'Раздел на сайте' },
      options: EMPLOYEE_SECTIONS.map((section) => ({ label: EMPLOYEE_SECTION_LABELS[section], value: section })),
      required: true,
    },
    { name: 'position', type: 'text', label: { en: 'Position', ru: 'Должность' } },
    {
      type: 'row',
      fields: [
        { name: 'phone', type: 'text', label: { en: 'Phone', ru: 'Телефон' } },
        { name: 'email', type: 'email', label: { en: 'Email', ru: 'Email' } },
      ],
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0, label: { en: 'Sort order', ru: 'Порядок сортировки' } },
    {
      name: 'photo',
      type: 'relationship',
      access: { update: capabilityFieldAccess('employee.media.update') },
      label: { en: 'Photo', ru: 'Фото' },
      relationTo: 'media',
    },
    { name: 'publicBio', type: 'textarea', label: { en: 'Public profile', ru: 'Публичный профиль' } },
    {
      type: 'tabs',
      tabs: [
        {
          label: { en: 'Objects', ru: 'Объекты' },
          fields: [
            {
              name: 'properties',
              type: 'join',
              admin: { allowCreate: false, defaultColumns: ['title', 'category', 'workflowStatus', 'price'] },
              collection: 'properties',
              label: { en: 'Properties', ru: 'Связанные объекты' },
              on: 'responsibleEmployee',
            },
          ],
        },
        {
          label: { en: 'Reviews', ru: 'Отзывы' },
          fields: [
            {
              name: 'reviews',
              type: 'join',
              admin: { allowCreate: false, defaultColumns: ['authorName', 'rating', 'status', 'reviewDate'] },
              collection: 'reviews',
              label: { en: 'Reviews', ru: 'Связанные отзывы' },
              on: 'employee',
            },
          ],
        },
        {
          label: { en: 'Activity', ru: 'История' },
          fields: [
            {
              name: 'activity',
              type: 'join',
              admin: { allowCreate: false, defaultColumns: ['label', 'details', 'triggeredBy', 'createdAt'] },
              collection: 'admin-activities',
              label: { en: 'Activity', ru: 'История изменений' },
              on: 'employee',
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [recordEmployeeActivity],
    beforeChange: [protectEmployeeMutation],
  },
} satisfies CollectionConfig
