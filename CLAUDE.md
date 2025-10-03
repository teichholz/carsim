This project is a 2d car simulation.
Goal is to simulate how car behaves in real traffic, for example on the autobahn when you have to slown when
you encounter a roundabout.

Features:
- Equilateral grid on which you can put your building blocks
- Building blocks which are for example streets / roundabouts / speed limits / car generators / ...
- clean modern ui with animations.

Equilateral Grid:
The Grid is equilateral, meaning all sides have the same length.
You should be able to zoom out and back in to a certain extent.
Amount of grids shoud be relative to the viewport.
The grid shoulb be infinite and rendered appropriately when needed.
Strg + Mouse should allow you to move around the grid.
The grid structure should only be seen when you hover a single grid quadrant with the mouse,
Then than quadrant should stand out / be highlighted.

Streets:
Strees should be able to be align both horizontally as well as vertically depending on the context.
They should also be able to build curves depending on the context.

Car Generators:
Car generators generate cars. The should have properties like:
- Frequency of car generation. Frequency should be in unit: car / tile
- Speed of each car. Speed should be in unit: tile / s

Cars will always drive bottom to top / left to right.

Car:
Cars should be represented as 2d circles which look like 3d rolling balls.
This shoulb be done via a realistic gradient.
Cars are spawned by the Car generator.

Building Blocks:
blocks should be able to be chosen via simple dialog window which is collapsable / expandable and can be moved
around the screen. Lets call this the Inventory. The inventory should have smooth animations when you hover over
an icon.

Simulation Start / Stop:
You should be be able to start / stop / speed up the simulation via floating action buttons at the bottom.
They should be cleanly animated and stand out. They should have a clean sound.

Debug Window:
The should be a debug window which shows useful information for debugging.

Sounds:
There should be sounds for:
- Cars that move
- Action Buttons
- Selecting different Building Blocks from the inventory

This project uses the following libraries for implementation:
- React Konvo for Canvas Rendering
- bitECS as Entity Component System