(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(require('strophe.js'))
    : typeof define === 'function' && define.amd
      ? define(['strophe.js'], factory)
      : factory(global.window);
})(this, function(strophe_js) {
  'use strict';

  /** File: strophe.pubsub.js
   *  A Strophe plugin for XMPP Publish-Subscribe.
   *
   *  Provides Strophe.Connection.pubsub object,
   *  parially implementing XEP 0060.
   *
   *  Strophe.Builder.prototype methods should probably move to strophe.js
   */
  /** Function: Strophe.Builder.form
   *  Add an options form child element.
   *
   *  Does not change the current element.
   *
   *  Parameters:
   *    (String) ns - form namespace.
   *    (Object) options - form properties.
   *
   *  Returns:
   *    The Strophe.Builder object.
   */
  strophe_js.Strophe.Builder.prototype.form = function(ns, options) {
    var aX = this.node.appendChild(
      strophe_js.Strophe.xmlElement('x', { xmlns: 'jabber:x:data', type: 'submit' })
    );
    aX.appendChild(strophe_js.Strophe.xmlElement('field', { var: 'FORM_TYPE', type: 'hidden' }))
      .appendChild(strophe_js.Strophe.xmlElement('value'))
      .appendChild(strophe_js.Strophe.xmlTextNode(ns));

    for (var i in options) {
      aX.appendChild(strophe_js.Strophe.xmlElement('field', { var: i }))
        .appendChild(strophe_js.Strophe.xmlElement('value'))
        .appendChild(strophe_js.Strophe.xmlTextNode(options[i]));
    }
    return this;
  };

  /** Function: Strophe.Builder.list
   *  Add many child elements.
   *
   *  Does not change the current element.
   *
   *  Parameters:
   *    (String) tag - tag name for children.
   *    (Array) array - list of objects with format:
   *          { attrs: { [string]:[string], ... }, // attributes of each tag element
   *             data: [string | XML_element] }    // contents of each tag element
   *
   *  Returns:
   *    The Strophe.Builder object.
   */
  strophe_js.Strophe.Builder.prototype.list = function(tag, array) {
    for (var i = 0; i < array.length; ++i) {
      this.c(tag, array[i].attrs);
      this.node.appendChild(
        array[i].data.cloneNode
          ? array[i].data.cloneNode(true)
          : strophe_js.Strophe.xmlTextNode(array[i].data)
      );
      this.up();
    }
    return this;
  };

  strophe_js.Strophe.Builder.prototype.children = function(object) {
    var key, value;
    for (key in object) {
      if (!object.hasOwnProperty(key)) continue;
      value = object[key];
      if (Array.isArray(value)) {
        this.list(key, value);
      } else if (typeof value === 'string') {
        this.c(key, {}, value);
      } else if (typeof value === 'number') {
        this.c(key, {}, '' + value);
      } else if (typeof value === 'object') {
        this.c(key)
          .children(value)
          .up();
      } else {
        this.c(key).up();
      }
    }
    return this;
  };

  // TODO Ideas Adding possible conf values?
  /* Extend Strophe.Connection to have member 'pubsub'.
 */
  strophe_js.Strophe.addConnectionPlugin('pubsub', {
    /*
Extend connection object to have plugin name 'pubsub'.
*/
    _connection: null,
    _autoService: true,
    service: null,
    jid: null,
    handler: {},

    //The plugin must have the init function.
    init: function(conn) {
      this._connection = conn;

      /*
        Function used to setup plugin.
        */

      /* extend name space
        *  NS.PUBSUB - XMPP Publish Subscribe namespace
        *              from XEP 60.
        *
        *  NS.PUBSUB_SUBSCRIBE_OPTIONS - XMPP pubsub
        *                                options namespace from XEP 60.
        */
      strophe_js.Strophe.addNamespace('PUBSUB', 'http://jabber.org/protocol/pubsub');
      strophe_js.Strophe.addNamespace(
        'PUBSUB_SUBSCRIBE_OPTIONS',
        strophe_js.Strophe.NS.PUBSUB + '#subscribe_options'
      );
      strophe_js.Strophe.addNamespace('PUBSUB_ERRORS', strophe_js.Strophe.NS.PUBSUB + '#errors');
      strophe_js.Strophe.addNamespace('PUBSUB_EVENT', strophe_js.Strophe.NS.PUBSUB + '#event');
      strophe_js.Strophe.addNamespace('PUBSUB_OWNER', strophe_js.Strophe.NS.PUBSUB + '#owner');
      strophe_js.Strophe.addNamespace(
        'PUBSUB_AUTO_CREATE',
        strophe_js.Strophe.NS.PUBSUB + '#auto-create'
      );
      strophe_js.Strophe.addNamespace(
        'PUBSUB_PUBLISH_OPTIONS',
        strophe_js.Strophe.NS.PUBSUB + '#publish-options'
      );
      strophe_js.Strophe.addNamespace(
        'PUBSUB_NODE_CONFIG',
        strophe_js.Strophe.NS.PUBSUB + '#node_config'
      );
      strophe_js.Strophe.addNamespace(
        'PUBSUB_CREATE_AND_CONFIGURE',
        strophe_js.Strophe.NS.PUBSUB + '#create-and-configure'
      );
      strophe_js.Strophe.addNamespace(
        'PUBSUB_SUBSCRIBE_AUTHORIZATION',
        strophe_js.Strophe.NS.PUBSUB + '#subscribe_authorization'
      );
      strophe_js.Strophe.addNamespace(
        'PUBSUB_GET_PENDING',
        strophe_js.Strophe.NS.PUBSUB + '#get-pending'
      );
      strophe_js.Strophe.addNamespace(
        'PUBSUB_MANAGE_SUBSCRIPTIONS',
        strophe_js.Strophe.NS.PUBSUB + '#manage-subscriptions'
      );
      strophe_js.Strophe.addNamespace(
        'PUBSUB_META_DATA',
        strophe_js.Strophe.NS.PUBSUB + '#meta-data'
      );
      strophe_js.Strophe.addNamespace('ATOM', 'http://www.w3.org/2005/Atom');

      if (conn.disco) conn.disco.addFeature(strophe_js.Strophe.NS.PUBSUB);
    },

    // Called by Strophe on connection event
    statusChanged: function(status, condition) {
      var that = this._connection;
      if (this._autoService && status === strophe_js.Strophe.Status.CONNECTED) {
        this.service = 'pubsub.' + strophe_js.Strophe.getDomainFromJid(that.jid);
        this.jid = that.jid;
      }
    },

    /***Function

    Parameters:
    (String) jid - The node owner's jid.
    (String) service - The name of the pubsub service.
    */
    connect: function(jid, service) {
      var that = this._connection;
      if (service === undefined) {
        service = jid;
        jid = undefined;
      }
      this.jid = jid || that.jid;
      this.service = service || null;
      this._autoService = false;
    },

    /***Function

     Parameters:
     (String) node - The name of node
     (String) handler - reference to registered strophe handler
     */
    storeHandler: function(node, handler) {
      if (!this.handler[node]) {
        this.handler[node] = [];
      }
      this.handler[node].push(handler);
    },

    /***Function

     Parameters:
     (String) node - The name of node
     */
    removeHandler: function(node) {
      var toberemoved = this.handler[node];
      this.handler[node] = [];

      // remove handler
      if (toberemoved && toberemoved.length > 0) {
        for (var i = 0, l = toberemoved.length; i < l; i++) {
          this._connection.deleteHandler(toberemoved[i]);
        }
      }
    },

    /***Function

    Create a pubsub node on the given service with the given node
    name.

    Parameters:
    (String) node -  The name of the pubsub node.
    (Dictionary) options -  The configuration options for the  node.
    (Function) call_back - Used to determine if node
    creation was sucessful.

    Returns:
    Iq id used to send subscription.
    */
    createNode: function(node, options, call_back) {
      var that = this._connection;

      var iqid = that.getUniqueId('pubsubcreatenode');

      var iq = strophe_js
        .$iq({ from: this.jid, to: this.service, type: 'set', id: iqid })
        .c('pubsub', { xmlns: strophe_js.Strophe.NS.PUBSUB })
        .c('create', { node: node });
      if (options) {
        iq.up()
          .c('configure')
          .form(strophe_js.Strophe.NS.PUBSUB_NODE_CONFIG, options);
      }

      that.addHandler(call_back, null, 'iq', null, iqid, null);
      that.send(iq.tree());
      return iqid;
    },

    /** Function: deleteNode
     *  Delete a pubsub node.
     *
     *  Parameters:
     *    (String) node -  The name of the pubsub node.
     *    (Function) call_back - Called on server response.
     *
     *  Returns:
     *    Iq id
     */
    deleteNode: function(node, call_back) {
      var that = this._connection;
      var iqid = that.getUniqueId('pubsubdeletenode');

      var iq = strophe_js
        .$iq({ from: this.jid, to: this.service, type: 'set', id: iqid })
        .c('pubsub', { xmlns: strophe_js.Strophe.NS.PUBSUB_OWNER })
        .c('delete', { node: node });

      that.addHandler(call_back, null, 'iq', null, iqid, null);
      that.send(iq.tree());

      return iqid;
    },

    /** Function
     *
     * Get all nodes that currently exist.
     *
     * Parameters:
     *   (Function) success - Used to determine if node creation was sucessful.
     *   (Function) error - Used to determine if node
     * creation had errors.
     */
    discoverNodes: function(success, error, timeout) {
      //ask for all nodes
      var iq = strophe_js
        .$iq({ from: this.jid, to: this.service, type: 'get' })
        .c('query', { xmlns: strophe_js.Strophe.NS.DISCO_ITEMS });

      return this._connection.sendIQ(iq.tree(), success, error, timeout);
    },

    /** Function: getConfig
     *  Get node configuration form.
     *
     *  Parameters:
     *    (String) node -  The name of the pubsub node.
     *    (Function) call_back - Receives config form.
     *
     *  Returns:
     *    Iq id
     */
    getConfig: function(node, call_back) {
      var that = this._connection;
      var iqid = that.getUniqueId('pubsubconfigurenode');

      var iq = strophe_js
        .$iq({ from: this.jid, to: this.service, type: 'get', id: iqid })
        .c('pubsub', { xmlns: strophe_js.Strophe.NS.PUBSUB_OWNER })
        .c('configure', { node: node });

      that.addHandler(call_back, null, 'iq', null, iqid, null);
      that.send(iq.tree());

      return iqid;
    },

    /**
     *  Parameters:
     *    (Function) call_back - Receives subscriptions.
     *
     *  http://xmpp.org/extensions/tmp/xep-0060-1.13.html
     *  8.3 Request Default Node Configuration Options
     *
     *  Returns:
     *    Iq id
     */
    getDefaultNodeConfig: function(call_back) {
      var that = this._connection;
      var iqid = that.getUniqueId('pubsubdefaultnodeconfig');

      var iq = strophe_js
        .$iq({ from: this.jid, to: this.service, type: 'get', id: iqid })
        .c('pubsub', { xmlns: strophe_js.Strophe.NS.PUBSUB_OWNER })
        .c('default');

      that.addHandler(call_back, null, 'iq', null, iqid, null);
      that.send(iq.tree());

      return iqid;
    },

    /***Function
        Subscribe to a node in order to receive event items.

        Parameters:
        (String) node         - The name of the pubsub node.
        (Array) options       - The configuration options for the  node.
        (Function) event_cb   - Used to recieve subscription events.
        (Function) success    - callback function for successful node creation.
        (Function) error      - error callback function.
        (Boolean) barejid     - use barejid creation was sucessful.

        Returns:
        Iq id used to send subscription.
    */
    subscribe: function(node, options, event_cb, success, error, barejid) {
      var that = this._connection;
      var iqid = that.getUniqueId('subscribenode');

      var jid = this.jid;
      if (barejid) jid = strophe_js.Strophe.getBareJidFromJid(jid);

      var iq = strophe_js
        .$iq({ from: this.jid, to: this.service, type: 'set', id: iqid })
        .c('pubsub', { xmlns: strophe_js.Strophe.NS.PUBSUB })
        .c('subscribe', { node: node, jid: jid });
      if (options) {
        iq.up()
          .c('options')
          .form(strophe_js.Strophe.NS.PUBSUB_SUBSCRIBE_OPTIONS, options);
      }

      //add the event handler to receive items
      var hand = that.addHandler(event_cb, null, 'message', null, null, null);
      this.storeHandler(node, hand);
      that.sendIQ(iq.tree(), success, error);
      return iqid;
    },

    /***Function
        Unsubscribe from a node.

        Parameters:
        (String) node       - The name of the pubsub node.
        (Function) success  - callback function for successful node creation.
        (Function) error    - error callback function.

    */
    unsubscribe: function(node, jid, subid, success, error) {
      var that = this._connection;
      var iqid = that.getUniqueId('pubsubunsubscribenode');

      var iq = strophe_js
        .$iq({ from: this.jid, to: this.service, type: 'set', id: iqid })
        .c('pubsub', { xmlns: strophe_js.Strophe.NS.PUBSUB })
        .c('unsubscribe', { node: node, jid: jid });
      if (subid) iq.attrs({ subid: subid });

      that.sendIQ(iq.tree(), success, error);
      this.removeHandler(node);
      return iqid;
    },

    /***Function

    Publish and item to the given pubsub node.

    Parameters:
    (String) node -  The name of the pubsub node.
    (Array) items -  The list of items to be published.
    (Function) call_back - Used to determine if node
    creation was sucessful.
    */
    publish: function(node, items, call_back) {
      var that = this._connection;
      var iqid = that.getUniqueId('pubsubpublishnode');

      var iq = strophe_js
        .$iq({ from: this.jid, to: this.service, type: 'set', id: iqid })
        .c('pubsub', { xmlns: strophe_js.Strophe.NS.PUBSUB })
        .c('publish', { node: node, jid: this.jid })
        .list('item', items);

      that.addHandler(call_back, null, 'iq', null, iqid, null);
      that.send(iq.tree());

      return iqid;
    },

    /*Function: items
    Used to retrieve the persistent items from the pubsub node.

    */
    items: function(node, success, error, timeout, mexNum) {
      //ask for all items
      var iq = strophe_js
        .$iq({ from: this.jid, to: this.service, type: 'get' })
        .c('pubsub', { xmlns: strophe_js.Strophe.NS.PUBSUB })
        .c('items', { node: node });
      iq.attrs({ max_items: mexNum });
      return this._connection.sendIQ(iq.tree(), success, error, timeout);
    },

    /** Function: getSubscriptions
     *  Get subscriptions of a JID.
     *
     *  Parameters:
     *    (Function) call_back - Receives subscriptions.
     *
     *  http://xmpp.org/extensions/tmp/xep-0060-1.13.html
     *  5.6 Retrieve Subscriptions
     *
     *  Returns:
     *    Iq id
     */
    getSubscriptions: function(call_back, timeout) {
      var that = this._connection;
      var iqid = that.getUniqueId('pubsubsubscriptions');

      var iq = strophe_js
        .$iq({ from: this.jid, to: this.service, type: 'get', id: iqid })
        .c('pubsub', { xmlns: strophe_js.Strophe.NS.PUBSUB })
        .c('subscriptions');

      that.addHandler(call_back, null, 'iq', null, iqid, null);
      that.send(iq.tree());

      return iqid;
    },

    /** Function: getNodeSubscriptions
     *  Get node subscriptions of a JID.
     *
     *  Parameters:
     *    (Function) call_back - Receives subscriptions.
     *
     *  http://xmpp.org/extensions/tmp/xep-0060-1.13.html
     *  5.6 Retrieve Subscriptions
     *
     *  Returns:
     *    Iq id
     */
    getNodeSubscriptions: function(node, call_back) {
      var that = this._connection;
      var iqid = that.getUniqueId('pubsubsubscriptions');

      var iq = strophe_js
        .$iq({ from: this.jid, to: this.service, type: 'get', id: iqid })
        .c('pubsub', { xmlns: strophe_js.Strophe.NS.PUBSUB_OWNER })
        .c('subscriptions', { node: node });

      that.addHandler(call_back, null, 'iq', null, iqid, null);
      that.send(iq.tree());

      return iqid;
    },

    /** Function: getSubOptions
     *  Get subscription options form.
     *
     *  Parameters:
     *    (String) node -  The name of the pubsub node.
     *    (String) subid - The subscription id (optional).
     *    (Function) call_back - Receives options form.
     *
     *  Returns:
     *    Iq id
     */
    getSubOptions: function(node, subid, call_back) {
      var that = this._connection;
      var iqid = that.getUniqueId('pubsubsuboptions');

      var iq = strophe_js
        .$iq({ from: this.jid, to: this.service, type: 'get', id: iqid })
        .c('pubsub', { xmlns: strophe_js.Strophe.NS.PUBSUB })
        .c('options', { node: node, jid: this.jid });
      if (subid) iq.attrs({ subid: subid });

      that.addHandler(call_back, null, 'iq', null, iqid, null);
      that.send(iq.tree());

      return iqid;
    },

    /**
     *  Parameters:
     *    (String) node -  The name of the pubsub node.
     *    (Function) call_back - Receives subscriptions.
     *
     *  http://xmpp.org/extensions/tmp/xep-0060-1.13.html
     *  8.9 Manage Affiliations - 8.9.1.1 Request
     *
     *  Returns:
     *    Iq id
     */
    getAffiliations: function(node, call_back) {
      var that = this._connection;
      var iqid = that.getUniqueId('pubsubaffiliations');

      if (typeof node === 'function') {
        call_back = node;
        node = undefined;
      }

      var attrs = {},
        xmlns = { xmlns: strophe_js.Strophe.NS.PUBSUB };
      if (node) {
        attrs.node = node;
        xmlns = { xmlns: strophe_js.Strophe.NS.PUBSUB_OWNER };
      }

      var iq = strophe_js
        .$iq({ from: this.jid, to: this.service, type: 'get', id: iqid })
        .c('pubsub', xmlns)
        .c('affiliations', attrs);

      that.addHandler(call_back, null, 'iq', null, iqid, null);
      that.send(iq.tree());

      return iqid;
    },

    /**
     *  Parameters:
     *    (String) node -  The name of the pubsub node.
     *    (Function) call_back - Receives subscriptions.
     *
     *  http://xmpp.org/extensions/tmp/xep-0060-1.13.html
     *  8.9.2 Modify Affiliation - 8.9.2.1 Request
     *
     *  Returns:
     *    Iq id
     */
    setAffiliation: function(node, jid, affiliation, call_back) {
      var that = this._connection;
      var iqid = that.getUniqueId('pubsubaffiliations');

      var iq = strophe_js
        .$iq({ from: this.jid, to: this.service, type: 'set', id: iqid })
        .c('pubsub', { xmlns: strophe_js.Strophe.NS.PUBSUB_OWNER })
        .c('affiliations', { node: node })
        .c('affiliation', { jid: jid, affiliation: affiliation });

      that.addHandler(call_back, null, 'iq', null, iqid, null);
      that.send(iq.tree());

      return iqid;
    },

    /** Function: publishAtom
     */
    publishAtom: function(node, atoms, call_back) {
      if (!Array.isArray(atoms)) atoms = [atoms];

      var i,
        atom,
        entries = [];
      for (i = 0; i < atoms.length; i++) {
        atom = atoms[i];

        atom.updated = atom.updated || new Date().toISOString();
        if (atom.published && atom.published.toISOString)
          atom.published = atom.published.toISOString();

        entries.push({
          data: strophe_js
            .$build('entry', { xmlns: strophe_js.Strophe.NS.ATOM })
            .children(atom)
            .tree(),
          attrs: atom.id ? { id: atom.id } : {},
        });
      }
      return this.publish(node, entries, call_back);
    },
  });
});
//# sourceMappingURL=strophe.pubsub.js.map