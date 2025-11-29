import { gql } from "apollo-server-express";

export const typeDefs = gql`
  scalar DateTime

  type Media { id: String! filename: String! url: String! mime_type: String! created_at: DateTime owner_id: String }
  type User { id: String! email: String! name: String role: String created_at: DateTime }
  type Category { id: String! name: String! slug: String! created_at: DateTime }
  type Tag { id: String! name: String! slug: String! created_at: DateTime }
  type Post { id: String! title: String! slug: String! excerpt: String content: String featured_image: String meta_title: String meta_description: String published_at: DateTime is_published: Boolean author_id: String created_at: DateTime }

  type PostConnection { items: [Post!]! total: Int! }

  type Query {
    posts(page: Int, pageSize: Int): PostConnection!
    post(slug: String!): Post
    users: [User!]!
    categories: [Category!]!
    tags: [Tag!]!
    media: [Media!]!
  }

  type UploadResult { url: String! filename: String! id: String! }

  type Mutation {
    insert_posts(title: String!, slug: String!, content: String!, excerpt: String, featured_image: String, meta_title: String, meta_description: String, published_at: DateTime, is_published: Boolean): Post
    upload_media(filename: String!, mime_type: String!, base64: String!): UploadResult
  }
`;