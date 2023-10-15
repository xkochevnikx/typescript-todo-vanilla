type ID = string | number;

interface ITodo {
    userId: ID;
    id: number;
    title: string;
    completed: boolean;
}

interface IUser {
    name: string;
    id: number;
}

(function () {
    const todoList = document.getElementById('todo-list');
    const userSelect = document.getElementById('user-todo');
    const form = document.querySelector('form');
    let todos: ITodo[] = [];
    let users: IUser[] = [];

    document.addEventListener('DOMContentLoaded', initApp);
    form?.addEventListener('submit', handleSubmit);

    function getUserName(userId: ID) {
        const user = users.find((u) => u.id === userId);
        if (user) {
            return user.name;
        }
    }

    function printTodo({ id, userId, title, completed }: ITodo) {
        const li = document.createElement('li');
        li.className = 'todo-item';
        li.dataset.id = String(id);
        li.innerHTML = `<span>${title} <i>by</i> <b>${getUserName(
            userId
        )}</b></span>`;

        const status = document.createElement('input');
        status.type = 'checkbox';
        status.checked = completed;
        status.addEventListener('change', handleTodoChange);

        const close = document.createElement('span');
        close.innerHTML = '&times;';
        close.className = 'close';
        close.addEventListener('click', handleClose);

        li.prepend(status);
        li.append(close);

        todoList?.prepend(li);
    }

    function createUserOption(user: IUser) {
        const option = document.createElement('option');
        option.value = String(user.id);
        option.innerText = user.name;
        userSelect?.append(option);
    }

    function removeTodo(todoId: ID) {
        todos = todos.filter((todo) => todo.id !== todoId);

        const todo = todoList?.querySelector(`[data-id="${todoId}"]`);
        if (todo) {
            todo.querySelector('input')?.removeEventListener(
                'change',
                handleTodoChange
            );
            todo.querySelector('.close')?.removeEventListener(
                'click',
                handleClose
            );
            todo.remove();
        }
    }

    function alertError(error: Error) {
        alert(error.message);
    }

    function initApp() {
        Promise.all([getAllTodos(), getAllUsers()]).then((values) => {
            [todos, users] = values;

            todos.forEach((todo) => printTodo(todo));
            users.forEach((user) => createUserOption(user));
        });
    }

    function handleSubmit(event: Event) {
        event.preventDefault();
        if (form) {
            createTodo({
                userId: Number(form.user.value),
                title: form.todo.value,
                completed: false,
            });
        }
    }

    function handleTodoChange(this: HTMLInputElement) {
        const parentElement = this.parentElement;
        if (parentElement) {
            const todoId = parentElement.dataset.id;
            const completed = this.checked;
            todoId && toggleTodoComplete(todoId, completed);
        }
    }

    function handleClose(this: HTMLSpanElement) {
        const parentElement = this.parentElement;
        if (parentElement) {
            const todoId = this.parentElement.dataset.id;
            todoId && deleteTodo(todoId);
        }
    }

    // Async logic
    async function getAllTodos() {
        try {
            const response = await fetch(
                'https://jsonplaceholder.typicode.com/todos?_limit=15'
            );
            const data = await response.json();

            return data;
        } catch (error) {
            if (error instanceof Error) {
                alertError(error);
            }
        }
    }

    async function getAllUsers() {
        try {
            const response = await fetch(
                'https://jsonplaceholder.typicode.com/users?_limit=5'
            );
            const data = await response.json();

            return data;
        } catch (error) {
            if (error instanceof Error) {
                alertError(error);
            }
        }
    }

    async function createTodo(todo: Omit<ITodo, 'id'>) {
        try {
            const response = await fetch(
                'https://jsonplaceholder.typicode.com/todos',
                {
                    method: 'POST',
                    body: JSON.stringify(todo),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            const newTodo = await response.json();

            printTodo(newTodo);
        } catch (error) {
            if (error instanceof Error) {
                alertError(error);
            }
        }
    }

    async function toggleTodoComplete(todoId: ID, completed: boolean) {
        try {
            const response = await fetch(
                `https://jsonplaceholder.typicode.com/todos/${todoId}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({ completed }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(
                    'Failed to connect with the server! Please try later.'
                );
            }
        } catch (error) {
            if (error instanceof Error) {
                alertError(error);
            }
        }
    }

    async function deleteTodo(todoId: ID) {
        try {
            const response = await fetch(
                `https://jsonplaceholder.typicode.com/todos/${todoId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                removeTodo(todoId);
            } else {
                throw new Error(
                    'Failed to connect with the server! Please try later.'
                );
            }
        } catch (error) {
            if (error instanceof Error) {
                alertError(error);
            }
        }
    }
})();
