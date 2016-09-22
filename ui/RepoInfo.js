import React from 'react';
import TimeAgo from 'react-timeago';
import { emojify } from 'node-emoji';

function RepoInfo({
  description,
  stargazers_count,
  open_issues_count,
  created_at,
  user_url,
  username,
  children,
  owner,
  owner_email
}) {
  const owner_label = owner + (owner_email ? ` (${owner_email})` : "");

  return (
    <div>
      <p>
        {description && emojify(description)}
      </p>
      <p>
        <InfoLabel
          label="Owner"
          value={owner_label}
        />
      </p>
      <p>
        <InfoLabel
          label="Stars"
          value={stargazers_count}
        />
        &nbsp;
        <InfoLabel
          label="Issues"
          value={open_issues_count}
        />
        &nbsp;
        {children}
        &nbsp;&nbsp;&nbsp;
        Submitted&nbsp;
        <TimeAgo
          date={created_at}
        />
        &nbsp;by&nbsp;
        <a href={user_url}>{username}</a>
      </p>
    </div>
  );
}

RepoInfo.propTypes = {
  description: React.PropTypes.string.isRequired,
  stargazers_count: React.PropTypes.number.isRequired,
  open_issues_count: React.PropTypes.number.isRequired,
  created_at: React.PropTypes.number.isRequired,
  user_url: React.PropTypes.string.isRequired,
  username: React.PropTypes.string.isRequired,
  children: React.PropTypes.node,
  owner: React.PropTypes.string.isRequired,
  owner_email: React.PropTypes.string
};

function InfoLabel({ label, value }) {
  return (
    <span className="label label-info">{label}: {value}</span>
  );
}

InfoLabel.propTypes = {
  label: React.PropTypes.string,
  value: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string])
};

export default RepoInfo;
