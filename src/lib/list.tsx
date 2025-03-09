import MyComponent from './ReactEditor';
import { unescape } from 'html-escaper';
export const generateComponentGroups = (component: any) => ({
  value: component._id,
  label: component.name,
  src: '/img/thumbs/layouts/stackedSide.jpg',
  srcDark: '/img/thumbs/layouts/stackedSide-dark.jpg',
  config: {
    configuration: {
      dataSource: 'manual' || 'controller' || 'globalState',
      key: '',
    },
    w: 60,
    h: 8,
    i: 'tags',
    name: component.name,
    component: (props: any) => {
      let data;
      const globalState = props.globalState;
      if (props?.configuration?.dataSource === 'manual') {
        data = props?.configuration?.data;
      } else if (props?.configuration?.dataSource === 'controller') {
      } else if (props?.configuration?.dataSource === 'globalState') {
        data = globalState?.[props?.configuration?.key];
      }
      return (
        <>
          {' '}
          <MyComponent
            componentRef={props.componentRef}
            jsx={unescape(component.jsx || component.content)}
            props={props.configuration}
            meta={props.item}
            setItemToEdit={props.setItemToEdit}
            currentItem={props.currentItem}
            currentLayout={props.currentLayout}
            allComponentsRaw={props.allComponentsRaw}
            renderComponent={props.renderComponent}
            allComponents={props.allComponents}
            checked={props.checked}
            editMode={props.editMode}
            isContainer={props?.isContainer}
            width={props.width}
            height={props.height}
            breakpoint={props.breakpoint}
            setHoveredItem={props.setHoveredItem}
            gridLayout={props.gridLayout}
            onLayoutChange={props.onLayoutChange}
          />
        </>
      );
    },
  },
});
