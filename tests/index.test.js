import TreeUtil from "../index";
const sampleColln = [
  { id: "3", name: "Sub category C", parentId: "1", type: "sub-category" },
  { id: "1", name: "Category A", type: "category" },
  { id: "2", name: "Sub category B", parentId: "1", type: "sub-category" },
  {
    id: "4",
    name: "Sub sub category D",
    parentId: "3",
    type: "sub-sub-category",
  },
];
const globalTree = new TreeUtil(sampleColln);

describe("Load the TreeUtil class", () => {
  it("throws en error if called without new operator", () => {
    expect(TreeUtil).toThrow("Cannot call a class as a function");
  });
  it("calls the class constructor", () => {
    const tree = new TreeUtil(sampleColln);
    expect(tree).toBeTruthy();
  });
  it("throws error for empty array", () => {
    expect(() => new TreeUtil([])).toThrow("Empty collection supplied");
  });
  it("throws error for collection not being an array", () => {
    expect(() => new TreeUtil({ a: 1 })).toThrow(
      "Collection type is not an Array"
    );
  });
});

describe("TreeUtil instance creates tree from array", () => {
  it("throws error for a collection node missing mandatory param 'id'", () => {
    expect(() => {
      new TreeUtil([
        { name: "Sub category C", parentId: "1", type: "sub-category" },
        { id: 1, name: "Category A", type: "category" },
      ]);
    }).toThrow("Node ID isnt found");
  });
  it("throws error for a collection not having a hierarchy", () => {
    expect(() => {
      new TreeUtil(
        [
          { id: 2, name: "A", parentId: 1 },
          { id: 3, name: "B", parentId: 1 },
        ],
        {
          rootId: 0,
          rootName: "root",
        }
      );
    }).toThrow("Parent ID is required");
  });
  it("creates tree from collection", () => {
    // const tree = new TreeUtil(sampleColln);
    expect(globalTree.get().model).toEqual({
      id: "rootId",
      name: "root",
    });
    expect(globalTree.get().children[0].model).toEqual({
      id: "1",
      name: "Category A",
      type: "category",
    });
  });
});

describe("TreeUtil instance helper functions", () => {
  it("works correctly returning the node when searched by id", () => {
    expect(globalTree.findNodeById("2")).toEqual({
      model: {
        id: "2",
        name: "Sub category B",
        parentId: "1",
        type: "sub-category",
      },
      children: [],
    });
  });
  it("throws error when searched by incorrect id", () => {
    expect(() => { globalTree.findNodeById("5") }).toThrow('Node ID isnt found');
  });

  it("correctly returns the max depth of the tree", () => {
    expect(globalTree.maxDepth()).toEqual(3);
  });

  it("correctly returns all nodes matching properties", () => {
    expect(
      globalTree.findAllNodesByProperty("name", "Category A")[0].model
    ).toEqual({ id: "1", name: "Category A", type: "category" });
  });

  it('throws error if children collection isnt the first parameter', () => {
    expect(() => {
      globalTree.updateNodes(
        globalTree.findNodeById("1"),
      (node) => (node.model.selected = true)
      );
    }).toThrow('Collection type is not an Array')
  })

  it('throws error if updateNode callback is not a function', () => {
    expect(() => {
      globalTree.updateNodes(
        globalTree.findNodeById("1").children
      );
    }).toThrow('Generic error message')
  })

  it("correctly updates all children nodes", () => {
    globalTree.updateNodes(
      globalTree.findNodeById("1").children,
      (node) => (node.model.selected = true)
    );

    expect(globalTree.findNodeById("4")).toEqual({
      model: {
        id: "4",
        name: "Sub sub category D",
        parentId: "3",
        type: "sub-sub-category",
        selected: true,
      },
      children: [],
    });

    //removing selected from globalTree
    globalTree.updateNodes(
      globalTree.findNodeById("1").children,
      (node) => (delete node.model.selected)
    )

    globalTree.updateNodes(
      globalTree.findNodeById("1").children,
      (node) => (node.model.type = node.model.type.replace(/-/g, ' '))
    )

    expect(globalTree.get().children[0].children).toEqual([
      {
        model: { id: "2", name: "Sub category B", parentId: "1", type: "sub category" },
        children: []
      },
      {
        model: { id: "3", name: "Sub category C", parentId: "1", type: "sub category" },
        children: [
          {
            model: { id: "4", name: "Sub sub category D", parentId: "3", type: "sub sub category", },
            children: []
          }
        ]
      }
    ])

    //adding hyphen back selected from globalTree
    globalTree.updateNodes(
      globalTree.findNodeById("1").children,
      (node) => (node.model.type = node.model.type.replace(/ /g, '-'))
    )
  });

  it('correctly fetches all nested nodes with matching property value', () => {
    const testTree = new TreeUtil([
      { id: "3", name: "Sub category C", parentId: "1", type: "sub-category", selected: true },
      { id: "1", name: "Category A", type: "category" },
      { id: "2", name: "Sub category B", parentId: "1", type: "sub-category", selected: false },
      { id: "4", name: "Sub sub category D", parentId: "3", type: "sub-sub-category", selected: true },
    ])
    const nestedNodes = globalTree.getNestedNodesByProperty(
      globalTree.findNodeById("1"),
      'type',
      'sub-category'
    );
    const nestedSelectedNodes = testTree.getNestedNodesByProperty(
      globalTree.findNodeById("1"),
      'selected',
      true
    );

    expect(nestedNodes).toEqual([
      {
        model: { id: "2", name: "Sub category B", parentId: "1", type: "sub-category" },
        children: []
      },
      {
        model: { id: "3", name: "Sub category C", parentId: "1", type: "sub-category" },
        children: [
          {
            model: { id: "4", name: "Sub sub category D", parentId: "3", type: "sub-sub-category", },
            children: []
          }
        ],
      }
    ])

    expect(nestedSelectedNodes).toEqual([
      {
        model: { id: "3", name: "Sub category C", parentId: "1", type: "sub-category", selected: true },
        children: [
          {
            model: { id: "4", name: "Sub sub category D", parentId: "3", type: "sub-sub-category", selected: true },
            children: []
          }
        ]
      },
      {
        model: { id: "4", name: "Sub sub category D", parentId: "3", type: "sub-sub-category", selected: true },
        children: []
      }
    ])
  })
});
