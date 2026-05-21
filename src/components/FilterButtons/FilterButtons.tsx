import classNames from 'classnames';

type FilterButtonsProps = {
  filterBy: 'all' | 'active' | 'completed';
  onFilter: (filter: 'all' | 'active' | 'completed') => void;
};

export const FilterButtons = ({ filterBy, onFilter }: FilterButtonsProps) => {
  return (
    <nav className="filter" data-cy="Filter">
      <a
        href="#/"
        className={classNames('filter__link', {
          selected: filterBy === 'all',
        })}
        data-cy="FilterLinkAll"
        onClick={() => onFilter('all')}
      >
        All
      </a>

      <a
        href="#/active"
        className={classNames('filter__link', {
          selected: filterBy === 'active',
        })}
        onClick={() => onFilter('active')}
        data-cy="FilterLinkActive"
      >
        Active
      </a>

      <a
        href="#/completed"
        className={classNames('filter__link', {
          selected: filterBy === 'completed',
        })}
        onClick={() => onFilter('completed')}
        data-cy="FilterLinkCompleted"
      >
        Completed
      </a>
    </nav>
  );
};
