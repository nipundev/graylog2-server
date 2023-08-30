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
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';

import { Button, Col, Label, Row } from 'components/bootstrap';
import { IconButton } from 'components/common';

import type { RuleBlock } from './types';
import { ruleBlockPropType, RuleBuilderTypes } from './types';
import { useRuleBuilder } from './RuleBuilderContext';

type Props = {
  block: RuleBlock,
  negatable?: boolean,
  onDelete: () => void,
  onEdit: () => void,
  onNegate: () => void,
  returnType?: RuleBuilderTypes,
}

const Highlighted = styled.span(({ theme }) => css`
  color: ${theme.colors.variant.info};
  font-weight: bold;
`);

const TypeLabel = styled(Label)(({ theme }) => css`
  margin-left: ${theme.spacings.xs};
`);

const StyledRow = styled(Row)<{ $hovered: boolean }>(({ theme, $hovered }) => css`
  cursor: pointer;
  display: flex;
  align-items: center;
  margin: 0px;
  height: ${theme.spacings.xl};
  background-color: ${$hovered ? '#f5f5f5' : 'transparent'};
`);

const NegationButton = styled(Button)<{ $negate: boolean }>(({ theme, $negate }) => css`
  opacity: ${$negate ? '1' : '0.3'};
  margin-right: ${theme.spacings.sm};
`);

const BlockTitle = styled.h5`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const ErrorMessage = styled.p(({ theme }) => css`
  color: ${theme.colors.variant.danger};
  font-size: 0.75rem;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  margin: 0px;
`);

const RuleBlockDisplay = ({ block, negatable, onEdit, onDelete, onNegate, returnType } : Props) => {
  const [showActions, setShowActions] = useState<boolean>(false);
  const [highlightedOutput, setHighlightedOutput] = useRuleBuilder().useHighlightedOutput;

  const readableReturnType = (type: RuleBuilderTypes): string | undefined => {
    switch (type) {
      case RuleBuilderTypes.Boolean:
        return 'boolean';
      case RuleBuilderTypes.Message:
        return 'message';
      case RuleBuilderTypes.Number:
        return 'number';
      case RuleBuilderTypes.Object:
        return 'object';
      case RuleBuilderTypes.String:
        return 'string';
      case RuleBuilderTypes.Void:
        return 'void';
      case RuleBuilderTypes.DateTime:
        return 'date_time';
      case RuleBuilderTypes.DateTimeZone:
        return 'date_time_zone';
      case RuleBuilderTypes.DateTimeFormatter:
        return 'date_time_formatter';
      default:
        return undefined;
    }
  };

  const returnTypeLabel = readableReturnType(returnType);

  const highlightedRuleTitle = (termToHighlight: string, title: string = '') => {
    const parts = title.split(/('\$.*?')/);

    const partsWithHighlight = parts.map((part) => {
      if (part === `'$${termToHighlight}'`) {
        return <Highlighted>{part}</Highlighted>;
      }

      return part;
    });

    return (
      partsWithHighlight.map((item, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <React.Fragment key={index}>
          {item}
        </React.Fragment>
      )));
  };

  return (
    <StyledRow onMouseEnter={() => setShowActions(true)}
               onMouseLeave={() => setShowActions(false)}
               $hovered={showActions}>
      <Col xs={9} md={10}>
        <Row>
          <Col xs={10} md={9}>
            <BlockTitle title={block?.step_title}>
              {negatable
              && <NegationButton bsStyle="primary" bsSize="xs" $negate={block?.negate ? 1 : 0} onClick={(e) => { e.target.blur(); onNegate(); }}>Not</NegationButton>}
              {highlightedOutput ? (
                highlightedRuleTitle(highlightedOutput, block?.step_title)
              ) : block?.step_title}
              {block?.errors?.length > 0 && (
                <ErrorMessage>{block.errors.join(', ')}</ErrorMessage>
              )}
            </BlockTitle>
          </Col>
          {block?.outputvariable && (
            <Col xs={2} md={3}>
              <Label bsStyle="primary"
                     onMouseEnter={() => setHighlightedOutput(block.outputvariable)}
                     onMouseLeave={() => setHighlightedOutput(undefined)}>
                {`$${block.outputvariable}`}
              </Label>
              {returnTypeLabel && (
              <TypeLabel bsStyle="default">
                {returnTypeLabel}
              </TypeLabel>
              )}
            </Col>
          )}
        </Row>
      </Col>
      <Col xs={3} md={2} className="text-right">
        {showActions && (
          <>
            <IconButton name="edit" onClick={onEdit} title="Edit" />
            <IconButton name="trash-alt" onClick={onDelete} title="Delete" />
          </>
        )}
      </Col>
    </StyledRow>
  );
};

RuleBlockDisplay.propTypes = {
  block: ruleBlockPropType,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  negatable: PropTypes.bool,
  onNegate: PropTypes.func.isRequired,
};

RuleBlockDisplay.defaultProps = {
  block: undefined,
  negatable: false,
  returnType: undefined,
};

export default RuleBlockDisplay;
