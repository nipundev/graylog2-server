/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
import React, { useMemo, useCallback, useState } from 'react';
import styled from 'styled-components';

import {
  Icon,
  Select,
} from 'components/common';
import { BootstrapModalForm, Alert, Input } from 'components/bootstrap';
import type { ChangeFieldTypeFormValues } from 'views/logic/fieldactions/ChangeFieldType/types';
import useFiledTypes from 'views/logic/fieldactions/ChangeFieldType/hooks/useFieldTypes';
import IndexSetsTable from 'views/logic/fieldactions/ChangeFieldType/IndexSetsTable';

const StyledSelect = styled(Select)`
  width: 400px;
  margin-bottom: 20px;
`;

type Props = {
  show: boolean,
  field: string,
  onSubmit: (formValues: ChangeFieldTypeFormValues) => void,
  onClose: () => void }

const ChangeFieldTypeModal = ({ show, onClose, onSubmit, field }: Props) => {
  const [rotated, setRotated] = useState(false);
  const [newFieldType, setNewFieldType] = useState(null);
  const { data: { fieldTypes }, isLoading: isOptionsLoading } = useFiledTypes();
  const fieldTypeOptions = useMemo(() => Object.entries(fieldTypes).map(([id, label]) => ({
    id,
    label,
  })), [fieldTypes]);

  const [indexSetSelection, setIndexSetSelection] = useState<Array<string>>();

  const _onSubmit = useCallback((e) => {
    e.preventDefault();
    onSubmit({ indexSetSelection, newFieldType, rotated });
  }, [indexSetSelection, newFieldType, onSubmit, rotated]);

  return (
    <BootstrapModalForm title={`Change ${field} field type`}
                        submitButtonText="Change field type"
                        onSubmitForm={_onSubmit}
                        onCancel={onClose}
                        show={show}
                        bsSize="large">
      <div>
        <Alert bsStyle="warning">
          <Icon name="info-circle" />&nbsp;
          Text about how bad to change this value and how you ca brake everything
        </Alert>
        <StyledSelect inputId="field_type"
                      valueKey="id"
                      options={fieldTypeOptions}
                      value={newFieldType}
                      onChange={(value) => setNewFieldType(value)}
                      placeholder="Select field type"
                      disabled={isOptionsLoading}
                      required />
        <Alert bsStyle="info">
          <Icon name="info-circle" />&nbsp;
          By default the type will be changed in all possible indexes. But you can choose in which index sets you would like to make the change
        </Alert>
        <IndexSetsTable field={field} setIndexSetSelection={setIndexSetSelection} fieldTypes={fieldTypes} />
        <Input type="checkbox"
               id="rotate"
               name="rotate"
               label="Rotating indexes"
               onChange={() => setRotated((cur) => !cur)}
               checked={rotated} />
      </div>
    </BootstrapModalForm>
  );
};

export default ChangeFieldTypeModal;
