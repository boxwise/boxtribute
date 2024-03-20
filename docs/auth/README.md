Authentication and our Auth0 dependency

Summary 
========

Boxtribute consists of a [legacy PHP application](https://github.com/boxwise/dropapp), and a [new Python+React based stack](https://github.com/boxwise/boxtribute) on which we are currently building a mobile-friendly interface.

Boxtribute is currently integrated with Auth0, with a dependency on its libraries and authorisation model. For context on the drivers behind that decision, see the [ADR on GitHub](https://github.com/boxwise/boxtribute/blob/master/docs/adr/adr_auth0.md). At the time we did not consider hosting our own open source identity provider such as [KeyCloak](https://github.com/keycloak/keycloak), [Authentik](https://goauthentik.io/), [Authelia](https://github.com/authelia/authelia) since they were not strong candidates given our priorities around ease of implementation and maintainability. Ideally, we'd like to enable this possibility to truly conform with best open source practices, and to enable our own flexibility should Auth0's current pricing model for non-profits (ie free) change.

Current state
=============

PHP App
-------

We use Auth0's OIDC library. For authorization, we utilise Auth0's role based access controls (RBAC) and [push both roles and role assignments](https://github.com/boxwise/dropapp/blob/0d6c30243638cbeb93fd3ffc2afe8fee06858ed2/library/lib/auth0.php#L96) to Auth0 via their API, to create the necessary JWT claims that our Python app utilises. The database user id is then [received via the JWT payload](https://github.com/boxwise/dropapp/blob/0d6c30243638cbeb93fd3ffc2afe8fee06858ed2/library/lib/session.php#L88). Note that claims are not used by the PHP app - they are loaded directly from the database.

Python App
----------

Users are authenticated via client-side [using the auth0 react integration](https://github.com/boxwise/boxtribute/blob/master/front/src/providers/Auth0ProviderWithHistory.tsx). This results in a JWT token that server-side [can extract claims from](https://github.com/boxwise/boxtribute/blob/ce750189ca272f7ac139c5c7e023cd63158afb10/back/boxtribute_server/auth.py#L143) and the front-end can use to [authenticate it's graphQL requests with apollo](https://github.com/boxwise/boxtribute/blob/master/front/src/providers/ApolloAuth0Provider.tsx).

For the Boxtribute API users request a token from our service's token endpoint which in turn [calls the Auth0 OAuth API](https://github.com/boxwise/boxtribute/blob/ce750189ca272f7ac139c5c7e023cd63158afb10/back/boxtribute_server/auth.py#L284).

For reference, the [ADR for authorization](https://github.com/boxwise/boxtribute/blob/master/docs/adr/adr_authorization-specification.md#specification-of-custom-jwt) and the [original design document](https://docs.google.com/document/d/1DYkwryrE4Q-Me-ZGFGzKJEm_VIWCXyghmjmLLFVwlxc/edit#heading=h.if4ha4s3dg7). 

Auth0
-----

We have [scripts in Auth0](https://github.com/boxwise/system-management/blob/main/services/auth0/prod/actions/dynamic-permissions/code.js) responsible for translating role assignments to action-based permissions for the Python front end.

Path to migration
=================

In principle we can swap any use of Auth0 from an authentication standpoint with a generic OIDC library for both the PHP and Python/React apps. For authorization, the use of JWT claims means this should be re-usable as-is in the Python app.

There are no RBAC standards for syncing these to our knowledge and as such, the 'push' from the PHP app to the identity service will always be more tightly coupled to the provider.

However, we'd like to isolate this integration boundary, to make it simpler to swap out another platform such as Keycloak.

Steps required for integration in the PHP app:

1.  Swap out the [Auth0 library usage](https://github.com/boxwise/dropapp/blob/master/library/lib/session.php) for a generic OIDC library: <https://github.com/thephpleague/oauth2-client>. 

2.  Replace [calls to the Auth0 API](https://github.com/boxwise/dropapp/blob/master/library/lib/auth0.php) with keycloak API instead.

3.  Update [browser tests](https://github.com/boxwise/dropapp/blob/0d6c30243638cbeb93fd3ffc2afe8fee06858ed2/cypress-session.php#L29) so authentication works with the new provider

Steps required for integration in the Python/React app:

1.  Swap out the [Auth0 react provider usage](https://github.com/boxwise/boxtribute/blob/master/front/src/providers/Auth0ProviderWithHistory.tsx) with a generic OIDC one: <https://github.com/authts/react-oidc-context>

2.  Update the [Apollo integration](https://github.com/boxwise/boxtribute/blob/master/front/src/providers/ApolloAuth0Provider.tsx) so it can detect the authenticated status.

3.  If the claims structure has changed, [review the back-end usage](https://github.com/boxwise/boxtribute/blob/ce750189ca272f7ac139c5c7e023cd63158afb10/back/boxtribute_server/auth.py#L143).

Steps required for reconfiguring the new external authentication identity provider:

1.  Move user-password DB

2.  Set up tenants and applications

3.  Migrate scripts for generating role- and action-based permissions

Other sensible refactoring while we do this:

1.  Some naming of routines currently mention auth0 but in reality should be just 'external authentication identity provider'

2.  In the PHP app our Auth0 integration defines global functions (as unfortunately with many in dropapp).

3.  In the PHP app our Auth0 integration have functions that are independent of Auth0 - these could live elsewhere - or at least require a review a sensible contract

4.  There is one instance [calling the management API outside of auth0 file](https://github.com/boxwise/dropapp/blob/0d6c30243638cbeb93fd3ffc2afe8fee06858ed2/include/cms_users_edit.php#L53-L66)
