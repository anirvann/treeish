const modelMappingFn = (node) => ({ model: { ...node }, ...{ children: [] } });

/** Class representing a tree generatiom utility. */
class TreeUtil {
  /**
   * Represents TreeUtil.
   * @constructor
   * @param {string} colln - The collection of nodes.
   * @param {string} opts - User definition of id, parentId, rootName.
   */
  constructor(colln, opts) {
    this._options = {
      parentId: (opts && opts.parentId) || "parentId",
      id: (opts && opts.id) || "id",
      rootId: (opts && opts.rootId) || "rootId",
      rootName: (opts && opts.rootName) || "root",
    };
    if (!Array.isArray(colln)) {
      this.errorHandler("NOT_AN_ARRAY");
    }
    if (!colln.length) {
      this.errorHandler("EMPTY_ARRAY");
    }
    const result = this.generateTree(colln);
    this._tree = result.tree;
    this._nodeSet = result.nodeSet;
  }

  /**
   * getter fn to return tree
   * @return {object} tree
   */
  get() {
    return this._tree;
  }

  /**
   * Funtion to create tree from collection
   * @param {array} collection - array representing the nodes
   * @return {object} - The newly generated tree and its flattened version
   */
  generateTree(collection) {
    const { rootId, rootName, id, parentId } = this._options;
    const tree = {
      model: {
        id: rootId,
        name: rootName,
      },
      children: [],
    };
    const nodeSet = {};

    for (let i = 0; i < collection.length; i++) {
      const node = collection[i];
      if (!Object.prototype.hasOwnProperty.call(node, id)) {
        this.errorHandler("ID_NOT_FOUND");
      }
      nodeSet[node.id] = modelMappingFn(node);
    }

    Object.keys(nodeSet).forEach((nodeId) => {
      const currentNode = nodeSet[nodeId];
      if (
        !Object.prototype.hasOwnProperty.call(currentNode["model"], parentId) ||
        currentNode["model"][parentId].toString() === rootId.toString()
      ) {
        tree.children.push(currentNode);
      } else {
        const pid = currentNode["model"][parentId];
        const parentNode =
          nodeSet[pid] || this.errorHandler("PARENTID_MISSING");
        parentNode.children = parentNode.children.concat(currentNode);
      }
    });

    return {
      tree,
      nodeSet,
    };
  }

  /**
   * Error handler
   * @param {string} type - error string which is mapped to handler
   */
  errorHandler(type) {
    switch (type) {
      case "EMPTY_ARRAY":
        throw new Error("Empty collection supplied");
      case "NOT_AN_ARRAY":
        throw new Error("Collection type is not an Array");
      case "ID_NOT_FOUND":
        throw new Error("Node ID isnt found");
      case "PARENTID_MISSING":
        throw new Error("Parent ID is required");
      default:
        throw new Error("Generic error message");
    }
  }

  /**
   * @param  {(number|string)} id - ID of the node to be searched for
   * @return {object} - Tree node whose ID matches.
   */
  findNodeById(id) {
    return this._nodeSet[id] || this.errorHandler("ID_NOT_FOUND");
  }

  /**
   * @param  {string} property - This is specific to the node, user can
   *                            mention the property by which the nodes
   *                            should be grouped together
   * @param  {(string|number|boolean)} value - This is the value of the
   *                                           property being searched.
   * @return {array} - The collection of nodes with property matching.
   */
  findAllNodesByProperty(property, value) {
    return Object.values(this._nodeSet).filter(
      (node) => node["model"][property] === value
    );
  }

  /**
   * Function to check and store max depth of the tree.
   * @return {number} - max depth of the tree
   */
  maxDepth() {
    let level = 1;
    Object.keys(this._nodeSet).forEach((node) => {
      let iteration = 1;
      let model = this._nodeSet[node].model;
      while (
        Object.prototype.hasOwnProperty.call(model, this._options.parentId) &&
        model[this._options.parentId] !== this._options.rootId
      ) {
        iteration++;
        model = this._nodeSet[model[this._options.parentId]]["model"];
      }
      if (iteration > level) {
        level = iteration;
      }
    });
    return level;
  }

  /**
   * @param  {array} children - Collection of nodes to be modified
   * @param  {function} callback - callback function to update nodes
   */
  updateNodes(children, callback) {
    if (!Array.isArray(children)) {
      this.errorHandler("NOT_AN_ARRAY");
    } else if (typeof callback !== "function") {
      this.errorHandler("NOT_A_FUNCTION");
    }
    children.map((node) => {
      callback(node);
      if (node.children.length) {
        this.updateNodes(node.children, callback);
      }
      return node;
    });
  }

  /**
   * @param  {object} node - The targetted node
   * @param  {string} property - The property name
   * @param  {(string|number|boolean)} value - value of the property
   * @return {array} - collection of children who match the property value
   */
  getNestedNodesByProperty(node, property, value) {
    const getIds = (node, ids) => {
      const id = node.model.id;
      ids.push(id);
      if (node.children.length) {
        node.children.map((nd) => getIds(nd, ids));
      }
      return ids;
    };
    const ids = getIds(node, []);
    return ids
      .filter((id) => this._nodeSet[id]["model"][property] === value)
      .map((id) => this._nodeSet[id]);
  }
}

export default TreeUtil;
