import React from 'react';

//providing a wrapper around each breadcrumb item.
//In addition, since we're rendering these items as a list,
// we can convert the elements used to be an ordered list
//so that we're being a little more formal about this:
//Also needed to define a new component BreadcrumbItem
const BreadcrumbItem = ({ children, ...props }) => (
    <li {...props}>
      {children}
    </li>
  )

const BreadcrumbSeparator = ({children, ...props}) => (
    <li className='breadcrumb-separator'{...props}>{children}</li>
)

const Breadcrumb = (props) => {

//React treats each component rendered directly under it as an array as 
//long as there are multiple components.

//When we manipulate this "array" of components using various methods 
//(such as slice), react needs a key to be passed into them each time. 
//When we use React.Children.toArray to wrap our children,
//react automatically assigns and handles all of the key requirements to
//the original children for subsequent uses. 
//Perfect - We don't have to apply unnecessary ugly code to our component code. 

    let children = React.Children.toArray(props.children)

    children = children.map((child,index)=>(
        <BreadcrumbItem key={`breadcrumb_item${index}`}>{child}</BreadcrumbItem>
    ))

    const lastIndex = children.length -1

    children = children.reduce((acc, child, index) => {
        // implemented a conditional check so that we don't unnecessarily render a trailing slash at the end of the breadcrumb
        const notLast = index < lastIndex
        if (notLast) {
            acc.push(
              child,
              <BreadcrumbSeparator key={`breadcrumb_sep${index}`}>
                {'>'}
              </BreadcrumbSeparator>,
            )
          } else {
            acc.push(child)
          }
          return acc
        }, [])

    return (
      <div><ol>{children}</ol></div>
    )
  }
  
export default Breadcrumb