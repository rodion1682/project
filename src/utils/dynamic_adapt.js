export const initDynamicAdapt = (type = 'max') => {
  const nodes = Array.from(document.querySelectorAll('[data-da]'))

  if (!nodes.length) {
    return () => {}
  }

  const objects = nodes
    .map((node, index) => {
      const data = node.dataset.da?.trim()

      if (!data) {
        return null
      }

      const dataArray = data.split(',').map((item) => item.trim())

      const destinationSelector = dataArray[0]
      const breakpoint = dataArray[1] || '767'
      const place = dataArray[2] || 'last'

      const destination = document.querySelector(destinationSelector)

      if (!destination) {
        return null
      }

      const parent = node.parentNode

      if (!parent) {
        return null
      }

      const anchor = document.createComment(`da-${index}`)

      parent.insertBefore(anchor, node)

      return {
        node,
        parent,
        anchor,
        destination,
        breakpoint,
        place,
        moved: false,
      }
    })
    .filter(Boolean)

  const groups = new Map()

  objects.forEach((object) => {
    const query = `(${type}-width: ${object.breakpoint}px)`

    if (!groups.has(query)) {
      groups.set(query, [])
    }

    groups.get(query).push(object)
  })

  const listeners = []

  const moveTo = (object) => {
    const { node, destination, place } = object

    if (object.moved) {
      return
    }

    if (place === 'first') {
      destination.prepend(node)
    } else if (place === 'last') {
      destination.append(node)
    } else {
      const index = Number(place)
      const children = Array.from(destination.children)

      if (Number.isInteger(index) && index >= 0 && index < children.length) {
        destination.insertBefore(node, children[index])
      } else {
        destination.append(node)
      }
    }

    object.moved = true
  }

  const moveBack = (object) => {
    if (!object.moved) {
      return
    }

    const { node, parent, anchor } = object

    if (anchor.parentNode === parent) {
      parent.insertBefore(node, anchor.nextSibling)
    }

    object.moved = false
  }

  const handleMedia = (mediaQuery, groupObjects) => {
    if (mediaQuery.matches) {
      groupObjects.forEach((object) => {
        moveTo(object)
      })

      return
    }

    groupObjects
      .slice()
      .reverse()
      .forEach((object) => {
        moveBack(object)
      })
  }

  groups.forEach((groupObjects, query) => {
    const mediaQuery = window.matchMedia(query)

    const handler = () => {
      handleMedia(mediaQuery, groupObjects)
    }

    mediaQuery.addEventListener('change', handler)

    listeners.push({
      mediaQuery,
      handler,
    })

    handleMedia(mediaQuery, groupObjects)
  })

  return () => {
    listeners.forEach(({ mediaQuery, handler }) => {
      mediaQuery.removeEventListener('change', handler)
    })

    objects
      .slice()
      .reverse()
      .forEach((object) => {
        moveBack(object)

        if (object.anchor.parentNode) {
          object.anchor.parentNode.removeChild(object.anchor)
        }
      })
  }
}
