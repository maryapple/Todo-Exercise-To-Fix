import React from 'react'
import ReactDOM from 'react-dom'

// Slomux - реализация Flux, в которой, как следует из нвазвания, что-то сломано.
// Нужно выяснить что здесь сломано

const createStore = (reducer, initialState) => {
    let currentState = initialState
    const listeners = []

    const getState = () => currentState
    const dispatch = action => {
        currentState = reducer(currentState, action)
        listeners.forEach(listener => listener())
    }

    const subscribe = listener => listeners.push(listener)

    return { getState, dispatch, subscribe }
}

const connect = (mapStateToProps, mapDispatchToProps) =>
    Component => {
        return class extends React.Component {
            render() {
                return (
                    <Component
                        {...mapStateToProps(store.getState(), this.props)}
                        {...mapDispatchToProps(store.dispatch, this.props)}
                        {...this.props}
                    />
                )
            }

            componentDidMount() {
                store.subscribe(this.handleChange)
            }

            handleChange = () => {
                this.forceUpdate()
            }
        }
    }

class Provider extends React.Component {
    componentWillMount() {
        window.store = this.props.store
    }

    render() {
        return this.props.children
    }
}

// APP

// actions
const ADD_TODO = 'ADD_TODO'

// action creators
const addTodo = todo => ({
    type: ADD_TODO,
    payload: todo,
})

// reducers
const reducer = (state = [], action) => {
    switch (action.type) {
        case ADD_TODO:
            state.push(action.payload)
            return state
        default:
            return state
    }
}

// components
class ToDoComponent extends React.Component {
    state = {
        todoText: ''
    }

    render() {
        return (
            <div>
                <label>{this.props.title || 'Без названия'}</label>
                <div>
                    <input
                        value={this.state.todoText}
                        placeholder="Название задачи"
                        onChange={this.updateText}
                    />
                    <button onClick={this.addTodo}>Добавить</button>
                    <ul>
                        {this.props.todos.map((todo, idx) => <li>{todo}</li>)}
                    </ul>
                </div>
            </div>
        )
    }

    updateText = (e) => {
        const { value } = e.target
        // ошибка: this.state.todoText = value
        this.setState({todoText: value})
    }

    addTodo = () => {
        this.props.addTodo(this.state.todoText)
        // ошибка: this.state.todoText = ''
        this.setState({ todoText: '' })
    }
}

const store = createStore(reducer, [])

const ToDo = connect(state => ({
    todos: state,
}), dispatch => ({
    addTodo: text => dispatch(addTodo(text)),
}))(ToDoComponent)

// init
ReactDOM.render(
    <Provider store={createStore(reducer, [])}>
        <ToDo title="Список задач" />
    </Provider>,
    document.getElementById('app')
)