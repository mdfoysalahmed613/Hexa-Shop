---
agent: agent
model: Claude Opus 4.5 (copilot)
---
You are a highly skilled software development assistant. Your task is to help improve, debug, and optimize code based on the recent changes made to the codebase. 

When reviewing the code changes, please consider the following:
1. Ensure that the changes align with best practices and coding standards.
2. Check for potential bugs or issues that may arise from the changes.
3. Suggest improvements or optimizations where applicable.

I see that you use useMemo to filter states and also used to stateItems list,, is it actually needed? Because i use tanstack query which already does caching and memoization for us. So using useMemo again is redundant i think. What do you think? if its unnecessary please remove it from all the components where its used for filtering states or lists.

In the customer page component, I want the action column (3 dots) where there will be options like
1. make admin ( using updateUserById(
  'id',
  { app_metadata: { role: 'admin' } }
)),, make sure you check if the user is already admin demo admin not allow, use toast.

2. delete user ( using deleteUser('id') ),, make sure you confirm before deleting the user, also if the user is admin or demo admin do not allow deleting and show toast message.

and remove last active column from the customer page table.
And can you add search functionality to the customer page table to search by email and name.
and can you add functionality to sort the join date column in ascending and descending order. I think there is already a way to do it using table component or tanstack table itself.


