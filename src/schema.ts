import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLID
} from "graphql";

import {
  connectionArgs,
  connectionFromArray,
  fromGlobalId
} from "graphql-relay";

import { siteStatistics, tickets, todoItems, users } from "./db";
import { paginate } from "./utils";

import {
  siteStatisticsType,
  ticketStatusEnum,
  ticketConnection,
  todoConnection,
  nodeField,
  userType,
  ticketsPaginatedType,
  todosPaginatedType
} from "./graphqlTypes";

import { mutationType } from "./mutations";
import { subscriptionType } from "./subscriptions";
import { PaginatedList, Ticket, TodoItem } from "./types";

let queryType = new GraphQLObjectType({
  name: "Query",
  fields: () => ({
    node: nodeField,
    userById: {
      type: userType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID)
        }
      },
      resolve(root, args) {
        let { id } = fromGlobalId(args.id);
        return users.find(u => u.id === parseInt(id, 10));
      }
    },
    siteStatistics: {
      type: new GraphQLNonNull(siteStatisticsType),
      resolve: () => siteStatistics
    },
    ticketsConnection: {
      type: new GraphQLNonNull(ticketConnection.connectionType),
      args: { status: { type: ticketStatusEnum }, ...connectionArgs },
      resolve(root, args) {
        return connectionFromArray(
          tickets.filter(ticket =>
            args.status ? ticket.status === args.status : true
          ),
          args
        );
      }
    },
    tickets: {
      type: new GraphQLNonNull(ticketsPaginatedType),
      args: {
        status: { type: ticketStatusEnum },
        limit: {
          type: new GraphQLNonNull(GraphQLInt)
        },
        offset: {
          type: new GraphQLNonNull(GraphQLInt)
        }
      },
      resolve(_, args, __): PaginatedList<Ticket> {
        const ticketsByStatus = tickets.filter(ticket =>
          args.status ? ticket.status === args.status : true
        );

        const offset = parseInt(args.offset, 10);
        const limit = parseInt(args.limit, 10);

        const results = paginate(offset, limit, ticketsByStatus);

        return {
          results,
          total: ticketsByStatus.length
        };
      }
    },
    todosConnection: {
      type: new GraphQLNonNull(todoConnection.connectionType),
      args: connectionArgs,
      resolve(root, args, obj) {
        return connectionFromArray(todoItems, args);
      }
    },
    todos: {
      type: new GraphQLNonNull(todosPaginatedType),
      args: {
        limit: {
          type: new GraphQLNonNull(GraphQLInt)
        },
        offset: {
          type: new GraphQLNonNull(GraphQLInt)
        }
      },
      resolve(_, args, __): PaginatedList<TodoItem> {
        const offset = parseInt(args.offset, 10);
        const limit = parseInt(args.limit, 10);

        const results = paginate(offset, limit, todoItems);

        return {
          results,
          total: todoItems.length
        };
      }
    }
  })
});

export let schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType,
  subscription: subscriptionType
});
