# GWU data

Data for use in apps built by Game Workers Unite.

This data is accessible on the web at `https://gameworkers.github.io/data/[path/in/repo]`.

For example, you can access a json list of chapter/member location and contact information at https://gameworkers.github.io/data/members.json.

This data on the master branch is used by live apps, so if you want to suggest a change please make a pull request and don't make changes directly to master!

## contributing

Pull requests to add or update data in this repository are welcome! If you're worried about future or current employers seeing your GitHub contribution history, consider creating a separate account to ensure your contributions are anonymous.

## normalizing data before merging

Data must be normalized to a specific structure and order before being merged. This makes it easier to review the data and compare it against other alphabetized lists. You can do this by running the following scripts:

* `scripts/check-if-normalized` to see whether the data is normalized (requires the `diff` shell command, which is available on most Unix-based systems, to be available)
* `scripts/normalize-data` which actually updates the data to be normalized
