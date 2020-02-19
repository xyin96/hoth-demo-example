import * as React from 'react';
import {KeyboardAvoidingView, FlatList, Text, View, StyleSheet, TouchableOpacity, TextInput} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

function todoListReducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO':
      return [...state, action.item];
    case 'UPDATE_TODO':
      return [...state.filter(todo => todo.id !== action.item.id), action.item];
    case 'REMOVE_TODO':
      return [...state.filter(todo => todo !== action.item)];
    default:
      throw new Error('Unknown Action: ' + action.type);
  }
}

let __id = 0;
function addTodo(todo /* string */) {
  return {
    type: 'ADD_TODO',
    item: {
      id: ++__id,
      todoMessage: todo,
    }
  };
}

function updateTodo(item) {
  return {
    type: 'UPDATE_TODO',
    item,
  };
}

function removeTodo(item) {
  return {
    type: 'REMOVE_TODO',
    item,
  };
}

const TodoListContext = React.createContext();

export default function TodoListScreen() {
  const [todos, dispatch] = React.useReducer(todoListReducer, [{todoMessage: 'hello', id: 0}]);

  return <TodoListContext.Provider value={dispatch}>
    <FlatList
      data={todos}
      renderItem={({item}) => <TodoListItem key={item.id} todo={item} />}
      ListFooterComponent={<TodoListItem key={__id + 1}/>}
    />
  </TodoListContext.Provider>
}

function TodoListItem(props) {
  const {todo} = props;
  const isNewTodo = todo == null;
  const [editing, setEditing] = React.useState(isNewTodo);
  const [value, setValue] = React.useState(todo?.todoMessage)
  const dispatch = React.useContext(TodoListContext);

  const buttons = React.useMemo(() =>{
    if (isNewTodo) {
      <View style={styles.todoListItemButtons}>
        <TouchableOpacity
          onPress={() => dispatch(addTodo(value))}
          style={styles.todoListItemButton}>
          <Ionicons name="md-add" size={24} color="#aaa"/>
        </TouchableOpacity>
      </View>
    } else if (editing) {
      return <View style={styles.todoListItemButtons}>
        <TouchableOpacity
          onPress={() => {
            setValue(todo?.todoMessage);
            setEditing(false);
          }}
          style={styles.todoListItemButton}>
          <Ionicons name="md-close" size={24} color="#aaa"/>
        </TouchableOpacity>
      </View>;
    } else {
      return <View style={styles.todoListItemButtons}>
        <TouchableOpacity
          onPress={() => {
            setValue(todo?.todoMessage);
            setEditing(true)
          }}
          style={styles.todoListItemButton}>
          <Ionicons name="md-create" size={24} color="#aaa"/>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => dispatch(removeTodo(todo))}
          style={styles.todoListItemButton}>
          <Ionicons name="md-trash" size={24} color="#aaa"/>
        </TouchableOpacity>
      </View>;
    }
  }, [isNewTodo, editing]);

  return <View style={styles.todoListItemContainer}>
    <View style={styles.todoListItemTextContainer}>
      {!editing
        ? <Text style={styles.todoListItemTextStyle}>{value}</Text>
        : <TextInput
            autoFocus
            value={value}
            style={styles.todoListItemTextStyle}
            onChangeText={setValue}
            onSubmitEditing={() => {
              if (isNewTodo) {
                dispatch(addTodo(value));
                setValue('');
              } else {
                dispatch(updateTodo({...todo, todoMessage: value}))
                setEditing(false);
              }
            }} />}
    </View>
    {buttons}
  </View>
}

const styles = StyleSheet.create({
  todoListItemContainer: {
    paddingHorizontal: 26,
    paddingVertical: 12,
    flex: 1,
    flexDirection: 'row',
  },
  todoListItemTextContainer: {
    flex: 1,
  },
  todoListItemTextStyle: {
    fontSize: 24,
  },
  todoListItemButtons: {
    flexDirection: 'row',
  },
  todoListItemButton: {
    paddingLeft: 16,
  }
})
