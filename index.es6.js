/** Class representing a tree generatiom utility. */
class TreeUtil {
  /**
   * Create a tree.
   * @param {array} colln - The collection of nodes (objects).
   * @param {object} options - The options to override the defaults.
   * @return {object} tree - The tree object with other methods is returned
   *                        to encapsulate the flattened tree within the class.
   */
  constructor(colln, options) {
    this.options = {...this.defOptions, ...options};
    const {tree, flattenedTree} = this.generateTree(colln, this.options);
    this._tree = tree;
    this._flattenedTree = flattenedTree;

    const maxDepth = this.maxDepth();

    this._tree.findNodeById = this.findNodeById;
    this._tree.updateNodes = this.updateNodes;
    this._tree.findAllNodesByProperty = this.findAllNodesByProperty;
    this._tree.getNestedNodesByProperty = this.getNestedNodesByProperty;
    this._tree.maxDepth = maxDepth;

    return this._tree;
  }

  defOptions = {
    parentId: 'pid', // key which holds the parentId
    id: 'id', // key which holds ID of the node
    rootId: 'root', // key which holds ID of the root node
    rootName: 'root', // key which holds name of the node
  };

  /**
   * @param  {(number|string)} id - ID of the node to be searched for
   * @return {object} - Tree node whose ID matches.
   */
  findNodeById = (id) =>
    !_flattenedTree[id]
      ? errorGenerator('ID_NOT_FOUND')
      : _flattenedTree[id];

  /**
   * @param  {string} property - This is specific to the node, user can
   *                            mention the property by which the nodes
   *                            should be grouped together
   * @param  {(string|number|boolean)} value - This is the value of the
   *                                           property being searched.
   * @return {array} - The collection of nodes with property matching.
   */
  findAllNodesByProperty = (property, value) =>
    Object.values(_flattenedTree).filter(
        (node) => node['model'][property] === value
    );


  /**
   * @param  {array} arrays - The array of arrays to be flattened
   * @return {array} - Flattened array
   */
  flattenArray = (arrays) => [].concat(...arrays);

  /**
   * @param  {object} node - Node whose children till depth N are being fetched
   * @return {array} - Flattened list of children
   */
  getNestedNodes = (node) => {
    const arr = [];
    arr.push({model: node.model});
    return node.children.length
      ? flattenArray(
          arr.concat(
              flattenArray(
                  node.children.map((node) => getNestedNodesByProperty(node))
              )
          )
      )
      : arr;
  };

  /**
   * @param  {object} node - The targetted node
   * @param  {string} property - The property name
   * @param  {(string|number|boolean)} value - value of the property
   * @return {array} - collection of children who match the property value
   */
  getNestedNodesByProperty = (node, property, value) => {
    const children = getNestedNodes(node);
    return children.filter((node) => node['model'][property] === value);
  };

  /**
   * @param  {array} children - Collection of nodes to be modified
   * @param  {function} callback - callback function to update nodes
   */
  updateNodes = (children, callback) => {
    if (!Array.isArray(children)) {
      errorGenerator('NOT_AN_ARRAY');
    } else if (typeof callback !== 'function') {
      errorGenerator('NOT_A_FUNCTION');
    }
    children.map((child) => {
      callback(child);
      if (child.children.length > 0) {
        updateNodes(child.children, callback);
      }
      return child;
    });
  };
  /**
   * @param  {array} colln - The collection of nodes
   * @param  {object} options - default options overriding object
   * @return {object} - The newly generated tree and its flattened version
   */
  generateTree = (colln, options) => {
    const {rootId, rootName, id, parentId} = options;
    const modelGenerator = this.modelGen; // eslint-disable-line
    const tree = {
      model: {
        id: rootId,
        name: rootName,
      },
      children: [],
    };

    if (!Array.isArray(colln)) {
      errorGenerator('NOT_AN_ARRAY');
    }

    const flattenedTree = colln.map(modelGenerator).reduce((acc, node) => {
      acc[node['model'][id]] = node;
      return acc;
    }, {});

    Object.keys(flattenedTree).map((nodeId) => {
      if (!flattenedTree[nodeId]['model'].hasOwnProperty(parentId)) {
        tree.children.push(flattenedTree[nodeId]);
      } else if (
        flattenedTree[nodeId]['model'][parentId].toString() ===
        rootId.toString()
      ) {
        tree.children.push(flattenedTree[nodeId]);
      } else {
        const pid = flattenedTree[nodeId]['model'][parentId];
        const parentNode = !flattenedTree[pid]
          ? errorGenerator('ROOTID_REQUIRED')
          : flattenedTree[pid];
        parentNode.children = parentNode.children.concat(flattenedTree[nodeId]);
      }
      return false;
    });

    if (tree.children.length === 0) {
      errorGenerator('TREE_FAILED');
    }
    return {tree, flattenedTree};
  };

  /**
   * Function to check and store max depth of the tree.
   * @return {number} - max depth of the tree
   */
  maxDepth = () => {
    let level = 1;
    const flatTree = this._flattenedTree; // eslint-disable-line
    const mergedOptions = this.options; // eslint-disable-line
    Object.keys(flatTree).forEach((node) => {
      let iteration = 1;
      let model = flatTree[node].model;
      while (model.hasOwnProperty(mergedOptions.parentId) &&
        model[mergedOptions.parentId] !== mergedOptions.rootId) {
        iteration++;
        model = flatTree[model[mergedOptions.parentId]]['model'];
      }
      if (iteration > level) {
        level = iteration;
      }
    });
    return level;
  }

  /**
   * Generic function to throw errors
   * @param  {string} type - string to decide what sort of error to be thrown.
   */
  errorGenerator = (type) => {
    switch (type) {
      case 'NOT_AN_ARRAY':
        throw new Error('Collection type is not an Array');
      case 'TREE_FAILED':
        throw new Error('Tree construction has failed');
      case 'ID_NOT_FOUND':
        throw new Error('ID supplied is incorrect');
      case 'NOT_A_FUNCTION':
        throw new Error('Callback supplied isnt a function');
      case 'ROOTID_REQUIRED':
        throw new Error(
            'Root ID is required as every node has a parent ID present'
        );
      default:
        throw new Error('Generic error message');
    }
  };

  /**
   * Generic function to create tree node with default and custom [key,values]
   * @param {object} node - the node of the tree to be created
   * @return {object} - The new node with custom and lib specific properties
   */
  modelGen = (node) => ({model: {...node}, ...{children: []}});
}

export default TreeUtil;
