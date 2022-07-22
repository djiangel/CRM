


import React, { Component, Fragment } from 'react'
import { Typography, Button, Card, Space, Row } from 'antd';
import { DeleteFilled } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { connect } from 'react-redux';
import { PermissionsChecker } from '../../../api/PermissionsChecker';

const { Text } = Typography;

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const grid = 4;


const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  // change background colour if dragging
  background: isDragging ? "#1890ff" : null,
  margin: `0 0 ${grid}px 0`,
  // styles we need to apply on draggables
  ...draggableStyle
});

const getListStyle = isDraggingOver => ({
  padding: grid,
});



export class DragNDropApproval extends Component {
  constructor(props) {
    super(props)

    this.state = {
      visible: false,
    }
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  onDragEnd(result) {
    if (!result.destination) {
      return;
    }

    const approvals = reorder(
      this.props.workflow.transition_approvals,
      result.source.index,
      result.destination.index
    )
    const newapprovals = approvals.map((approval, index) => {
      approval.priority = index;
      return approval;
    });
    this.props.reorderTransitions(newapprovals)
  }

  render() {
    if (this.props.workflow.workflow.permissions['river.change_transitionapprovalmeta']) {
      return (
        <DragDropContext onDragEnd={this.onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={getListStyle(snapshot.isDraggingOver)}
              >
                {this.props.workflow.transition_approvals.map((item) => (
                  <Draggable key={item.id} draggableId={"" + item.id} index={item.priority}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(
                          snapshot.isDragging,
                          provided.draggableProps.style
                        )}
                      >
                        <Card className="hoveritem">
                          <Space>
                            <Text>
                              Priority : {item.priority + 1}
                            </Text>

                            {item.groups.map((group, index) => {
                              return (
                                <Button shape="round" key={index}>{group.name}</Button>
                              )
                            })}
                          </Space>

                          {this.props.workflow.workflow.permissions['river.delete_transitionapprovalmeta'] ?
                            <Button type="danger" shape="round" onClick={() => this.props.deleteApproval(item.id)} icon={<DeleteFilled />} style={{ float: "right" }} />
                            :
                            null
                          }
                        </Card>

                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )
    } else {
      return (
        <Fragment>
          {
            this.props.workflow.transition_approvals.map((item) => (
              <Card key={item.id}>
                <Space>
                  <Text>
                    Priority : {item.priority + 1}
                  </Text>
                  {item.groups.map((group) => {
                    return (
                      <Button shape="round" key={group.id}>{group.name}</Button>
                    )
                  })}
                </Space>
              </Card>
            ))}
        </Fragment>)
    }
  }
}


const mapDispatchToProps = dispatch => {
  return {
    deleteApproval: (approval) => dispatch({ type: 'DELETE_TRANSITION_APPROVAL', id: approval }),
    reorderTransitions: (newapprovals) => dispatch({ type: 'REORDER_TRANSITION_APPROVALS', newApprovals: newapprovals }),
    approve: (class_id, object_id, next_state, transition) => dispatch({ type: 'APPROVE_TRANSITION_APPROVAL', workflow_id: class_id, workflow_object_id: object_id, next_state_id: next_state, transition_id: transition })
  }
}

const mapStateToProps = state => ({
  person: state.auth
})




export default connect(mapStateToProps, mapDispatchToProps)(DragNDropApproval);