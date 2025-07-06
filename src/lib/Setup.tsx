import { useEffect } from 'react';
import Sortable from 'sortablejs';

export const SortableContainerSetup = ({ }) => {
    useEffect(() => {
        const containers = document.querySelectorAll('.cube');
        containers.forEach((container) => {
            if (!container.getAttribute('data-sortable-init')) {
                Sortable.create(container, {
                    group: { name: 'sortable-list-2', pull: true, put: true },
                    animation: 150,
                    ghostClass: 'sortable-ghost',
                });
                container.setAttribute('data-sortable-init', 'true');
            }
        });
    }, []);

    return (
        <></>
    );
}
