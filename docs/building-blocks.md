Building Blocks consist of 2 parts.
1. Their UI component
2. Their logic component

All bulidinnng bolcks live in a map.
Keys are the grid coordinates and the value is an abstract building block interface / class.
The map should be part of the simulation state (zustand.)

UI Components should have access to:
- Their grid location
- The building block map. UI componets will sometimes need to change their design depending on the

All UI Components should implement a common interface which is used to store them in the map.
You should be able to check the concrete type of building block if necessary.

Some building blocks might need a logic component, which allows to configure the building block by opening a side panel to the right (or if there is no space to the left). Not all building blocks will need a logic component.

The Building Blocks are:
- Street: A street only has a UI component, since for now every street behaves the same. The street ui component consists of 7 sub components, depending on how the street is connect. There are:
    - Lonely street, if the street does not have any neigbour that is a street
    - Horizontal street
    - Vertical street
    - Curved street (4 each)
For now the street should be represented by 2 straight or curved lines, which almost fully fill out the quadrant they are in.