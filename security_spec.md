# Security Specification for Beacon

## Data Invariants
1. **Users**: A user can only create/update their own profile. Username must be unique (handled by app logic, but rules protect the document).
2. **Posts**: 
   - Only authenticated users can create posts.
   - `authorId` must match the current user.
   - Only the author can update their post content.
   - Anyone can read public posts.
3. **Likes**:
   - A user can like a post by creating a document in the `likes` subcollection.
   - Users can only create their own like record.
   - Incrementing `post.likesCount` must happen atomically (batch/transaction) - rules will enforce schema but client handles atomicity.

## Dirty Dozen Payloads (Rejected)
1. Creating a post with another user's `authorId`.
2. Updating someone else's post content.
3. Deleting someone else's post.
4. Setting `likesCount` to 999999 manually.
5. Creating a user profile with a different UID than the auth token.
6. Changing `createdAt` on an existing post.
7. Injecting 1MB strings into the `username` field.
8. Listing users' private collections without being owner.
9. Following yourself.
10. Creating a notification for yourself from someone else.
11. Updating a post but changing the `authorId`.
12. Accessing data without any authentication.
