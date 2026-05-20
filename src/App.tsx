/* eslint-disable max-len */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import { createTodo, deleteTodo, getTodos, USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import classNames from 'classnames';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterBy, setFilterBy] = useState<'all' | 'active' | 'completed'>(
    'all',
  );
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [title, setTitle] = useState('');
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [deleteIds, setDeletedIds] = useState<number[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  function getFilteredTodos(
    todosToFilter: Todo[],
    filter: 'all' | 'active' | 'completed',
  ) {
    switch (filter) {
      case 'active':
        return todosToFilter.filter(todo => !todo.completed);
      case 'completed':
        return todosToFilter.filter(todo => todo.completed);
      default:
        return todosToFilter;
    }
  }

  const filteredTodos = getFilteredTodos(todos, filterBy);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (trimmedTitle.length === 0) {
      setErrorMessage('Title should not be empty');
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);

      return;
    }

    setIsLoading(true);

    const temporaryTodo = {
      id: 0,
      title: trimmedTitle,
      completed: false,
      userId: USER_ID,
    };

    setTempTodo(temporaryTodo);

    createTodo({ title: trimmedTitle, completed: false, userId: USER_ID })
      .then(currentTodo => {
        setTodos([...todos, currentTodo]);
        setTitle('');
      })
      .catch(() => {
        setErrorMessage('Unable to add a todo');
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
      })
      .finally(() => {
        setTempTodo(null);
        setIsLoading(false);
        inputRef.current?.focus();
      });
  }

  function handleDelete(todoId: number) {
    setDeletedIds(prevIds => [...prevIds, todoId]);

    deleteTodo(todoId)
      .then(() => {
        setTodos(prevTodos => prevTodos.filter(todo => todo.id !== todoId));
      })
      .catch(() => {
        setErrorMessage('Unable to delete a todo');
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
      })
      .finally(() => {
        setDeletedIds(prevIds =>
          prevIds.filter(deleteId => deleteId !== todoId),
        );
        inputRef.current?.focus();
      });
  }

  function handleClearCompleted() {
    const deletedTodos = todos.filter(todo => todo.completed === true);

    deletedTodos.forEach(deletedTodo => handleDelete(deletedTodo.id));
  }

  useEffect(() => {
    setIsLoading(true);
    setErrorMessage('');
    getTodos()
      .then(currentTodos => setTodos(currentTodos))
      .catch(() => {
        setErrorMessage('Unable to load todos');
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (isLoading === false) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className="todoapp__toggle-all active"
            data-cy="ToggleAllButton"
          />

          {/* Add a todo on form submit */}
          <form onSubmit={handleSubmit}>
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              disabled={isLoading}
              ref={inputRef}
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </form>
        </header>

        {todos.length > 0 && (
          <>
            <section className="todoapp__main" data-cy="TodoList">
              {filteredTodos.map(todo => {
                return (
                  <div
                    key={todo.id}
                    data-cy="Todo"
                    className={classNames('todo', {
                      completed: todo.completed,
                    })}
                  >
                    <label className="todo__status-label">
                      <input
                        data-cy="TodoStatus"
                        type="checkbox"
                        className="todo__status"
                        checked={todo.completed}
                      />
                    </label>

                    <span data-cy="TodoTitle" className="todo__title">
                      {todo.title}
                    </span>

                    {/* Remove button appears only on hover */}
                    <button
                      type="button"
                      className="todo__remove"
                      data-cy="TodoDelete"
                      onClick={() => handleDelete(todo.id)}
                    >
                      ×
                    </button>

                    {/* This form is shown instead of the title and remove button */}
                    {/* <form>
                  <input
                    data-cy="TodoTitleField"
                    type="text"
                    className="todo__title-field"
                    placeholder="Empty todo will be deleted"
                    value="Todo is being edited now"
                  />
                </form> */}

                    {/* overlay will cover the todo while it is being deleted or updated */}
                    <div
                      data-cy="TodoLoader"
                      className={classNames('modal', 'overlay', {
                        'is-active': deleteIds.includes(todo.id),
                      })}
                    >
                      {' '}
                      {/*is-active*/}
                      <div className="modal-background has-background-white-ter" />
                      <div className="loader" />
                    </div>
                  </div>
                );
              })}
              {tempTodo && (
                <div
                  data-cy="Todo"
                  className={classNames('todo', {
                    completed: tempTodo?.completed,
                  })}
                >
                  <label className="todo__status-label">
                    <input
                      data-cy="TodoStatus"
                      type="checkbox"
                      className="todo__status"
                      checked={tempTodo?.completed}
                    />
                  </label>

                  <span data-cy="TodoTitle" className="todo__title">
                    {tempTodo?.title}
                  </span>

                  {/* Remove button appears only on hover */}
                  <button
                    type="button"
                    className="todo__remove"
                    data-cy="TodoDelete"
                  >
                    ×
                  </button>

                  <div data-cy="TodoLoader" className="modal overlay is-active">
                    {' '}
                    {/*is-active*/}
                    <div className="modal-background has-background-white-ter" />
                    <div className="loader" />
                  </div>
                </div>
              )}
            </section>
            <footer className="todoapp__footer" data-cy="Footer">
              <span className="todo-count" data-cy="TodosCounter">
                {todos.filter(todo => !todo.completed).length} items left
              </span>

              {/* Active link should have the 'selected' class */}
              <nav className="filter" data-cy="Filter">
                <a
                  href="#/"
                  className={classNames('filter__link', {
                    selected: filterBy === 'all',
                  })}
                  data-cy="FilterLinkAll"
                  onClick={() => setFilterBy('all')}
                >
                  All
                </a>

                <a
                  href="#/active"
                  className={classNames('filter__link', {
                    selected: filterBy === 'active',
                  })}
                  onClick={() => setFilterBy('active')}
                  data-cy="FilterLinkActive"
                >
                  Active
                </a>

                <a
                  href="#/completed"
                  className={classNames('filter__link', {
                    selected: filterBy === 'completed',
                  })}
                  onClick={() => setFilterBy('completed')}
                  data-cy="FilterLinkCompleted"
                >
                  Completed
                </a>
              </nav>

              {/* this button should be disabled if there are no completed todos */}
              <button
                type="button"
                className="todoapp__clear-completed"
                data-cy="ClearCompletedButton"
                disabled={todos.filter(todo => todo.completed).length === 0}
                onClick={handleClearCompleted}
              >
                Clear completed
              </button>
            </footer>
          </>
        )}
      </div>

      <div
        data-cy="ErrorNotification"
        className={classNames(
          'notification',
          'is-danger',
          'is-light',
          'has-text-weight-normal',
          { hidden: errorMessage === '' },
        )}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setErrorMessage('')}
        />
        {errorMessage}
      </div>
    </div>
  );
};
