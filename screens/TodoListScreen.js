import * as React from 'react';
import {KeyboardAvoidingView, FlatList, Text, View, StyleSheet, TouchableOpacity, TextInput} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

import * as firebase from 'firebase';
import 'firebase/firestore';

function todoListReducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO':
      return [...state, {...action.item, id: state.length}];
    case 'UPDATE_TODO':
      const updatedIndex = state.findIndex(todo => todo.id === action.item.id);
      return [...state.slice(0, updatedIndex), action.item, ...state.slice(updatedIndex + 1)];
    case 'REMOVE_TODO':
      return [...state.filter(todo => todo.id !== action.item.id)];
    default:
      throw new Error('Unknown Action: ' + action.type);
  }
}

function addTodo(todo /* string */) {
  return {
    type: 'ADD_TODO',
    item: {
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

const cache = new Map();

function getUserDocPromise(id) {
  if (!cache.has(id)) {
    const promise = firebase.firestore().collection("users").doc(id).get();

    let status = "pending";
    let result;
    let suspender = promise.then(
      r => {
        status = "success";
        result = r;
      },
      e => {
        status = "error";
        result = e;
      }
    );

    cache.set(id, {
      read() {
        if (status === "pending") {
          throw suspender;
        } else if (status === "error") {
          throw result;
        } else if (status === "success") {
          return result;
        }
      }
    });
}
    return cache.get(id);
};

export default function TodoListScreen() {
  const currentUser = firebase.auth().currentUser;
  const initialState = getUserDocPromise(currentUser?.uid).read();
  const [todos, dispatch] = React.useReducer(todoListReducer, initialState.get('todos') ?? []);

  React.useEffect(() => {
    firebase.firestore().collection("users").doc(currentUser?.uid).set({todos});
  }, [todos]);

  return <TodoListContext.Provider value={dispatch}>
    <FlatList
      data={todos}
      renderItem={({item}) => <TodoListItem key={item} todo={item} />}
      ListFooterComponent={<TodoListItem />}
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
