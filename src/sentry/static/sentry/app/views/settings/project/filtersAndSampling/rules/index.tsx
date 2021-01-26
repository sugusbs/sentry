import React from 'react';
import {
  DragDropContext,
  DragDropContextProps,
  Draggable,
  Droppable,
} from 'react-beautiful-dnd';
import styled from '@emotion/styled';

import {PanelTable} from 'app/components/panels';
import {t} from 'app/locale';
import {DynamicSamplingRule} from 'app/types/dynamicSampling';

import Rule from './rule';
import {layout} from './utils';

const queryAttr = 'data-rbd-drag-handle-draggable-id';

type DragEndChildrenProps = Required<Parameters<DragDropContextProps['onDragEnd']>[0]>;

type Props = {
  rules: Array<DynamicSamplingRule>;
  onEditRule: (rule: DynamicSamplingRule) => () => void;
  onDeleteRule: (rule: DynamicSamplingRule) => () => void;
  onDragEnd: (result: DragEndChildrenProps) => void;
  disabled: boolean;
};

type State = {
  placeholderProps?: {
    clientHeight: number;
    clientWidth: number;
    clientY: number;
    clientX: number;
  };
};

class Rules extends React.Component<Props, State> {
  state: State = {};

  handleDragEnd = (result: Parameters<DragDropContextProps['onDragEnd']>[0]) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    this.props.onDragEnd(result as DragEndChildrenProps);
    this.setState({placeholderProps: undefined});
  };

  handleDragUpdate = (
    update: Parameters<NonNullable<DragDropContextProps['onDragUpdate']>>[0]
  ) => {
    if (!update.destination) {
      return;
    }
    const {draggableId, destination} = update;
    const {index: destinationIndex} = destination;

    const domQuery = `[${queryAttr}='${draggableId}']`;
    const draggedDOM = document.querySelector(domQuery);

    if (!draggedDOM) {
      return;
    }

    const {clientHeight, clientWidth} = draggedDOM;

    const domParentNode = draggedDOM.parentNode as Element;

    const clientY =
      parseFloat(window.getComputedStyle(domParentNode).paddingTop) +
      [...(domParentNode.children as any)]
        .slice(0, destinationIndex)
        .reduce((total, curr) => {
          const style = curr.currentStyle || window.getComputedStyle(curr);
          const marginBottom = parseFloat(style.marginBottom);
          return total + curr.clientHeight + marginBottom;
        }, 0);

    this.setState({
      placeholderProps: {
        clientHeight,
        clientWidth,
        clientY,
        clientX: parseFloat(window.getComputedStyle(domParentNode).paddingLeft),
      },
    });
  };

  render() {
    const {onEditRule, onDeleteRule, disabled, rules} = this.props;
    return (
      <DragDropContext
        onDragEnd={this.handleDragEnd}
        onDragUpdate={this.handleDragUpdate}
      >
        <Droppable droppableId="droppable">
          {({innerRef, placeholder, ...props}) => (
            <StyledPanelTable
              {...props}
              forwardRef={innerRef}
              headers={['', t('Event Type'), t('Category'), t('Sampling Rate'), '']}
              isEmpty={!rules.length}
              emptyMessage={t('There are no rules to display')}
            >
              {rules.map((rule, index) => (
                <Draggable key={rule.id} draggableId={rule.id} index={index}>
                  {(
                    {dragHandleProps, draggableProps, innerRef: innerRefDraggable},
                    {isDragging}
                  ) => (
                    <Rule
                      {...draggableProps}
                      isDragging={isDragging}
                      dragHandle={dragHandleProps}
                      ref={innerRefDraggable}
                      key={index}
                      rule={rule}
                      onEditRule={onEditRule(rule)}
                      onDeleteRule={onDeleteRule(rule)}
                      disabled={disabled}
                    />
                  )}
                </Draggable>
              ))}
              {placeholder}
            </StyledPanelTable>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
}

export default Rules;

const StyledPanelTable = styled(PanelTable)`
  overflow: visible;
  margin-bottom: 0;
  border: none;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  ${p => layout(p.theme)}

  > * {
    :nth-child(-n + 6) {
      border-bottom: 1px solid ${p => p.theme.border};
    }

    ${p =>
      !p.isEmpty &&
      `
        :nth-child(n + 6) {
          display: grid;
          grid-column: 1/-1;
          padding: 0;
        }
      `}
  }
`;
