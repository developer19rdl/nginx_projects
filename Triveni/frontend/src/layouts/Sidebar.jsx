import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useAuth } from '../contexts/AuthContext';
import { NAV_GROUPS } from '../config/navigation';

export const DRAWER_WIDTH = 248;
export const DRAWER_WIDTH_COLLAPSED = 72;

/** One group's items - collapsed mode hides the group's caption (an icon-only rail has no room
 * for section labels) and shows a thin divider between groups instead, so the rail doesn't read
 * as one undifferentiated icon stack. */
function NavGroup({ group, collapsed, activePath, onNavigate, isFirst }) {
  const { hasPermission } = useAuth();
  const items = group.items.filter((item) => !item.permission || hasPermission(item.permission));
  if (!items.length) return null;

  return (
    <Box sx={{ mb: 1 }}>
      {collapsed ? (
        !isFirst && <Divider sx={{ mx: 1.5, my: 1 }} />
      ) : (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ px: 2.5, fontWeight: 700, letterSpacing: 0.6, display: 'block', mb: 0.5, mt: isFirst ? 0 : 1.5 }}
        >
          {group.label}
        </Typography>
      )}
      <List sx={{ px: 1, py: 0 }}>
        {items.map((item) => {
          const active = activePath === item.path;
          const button = (
            <ListItemButton
              selected={active}
              onClick={() => onNavigate(item.path)}
              sx={{
                justifyContent: collapsed ? 'center' : 'flex-start',
                px: collapsed ? 1.5 : 2,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed ? 0 : 38,
                  mr: collapsed ? 0 : 1,
                  justifyContent: 'center',
                  color: active ? 'primary.main' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: active ? 700 : 500, fontSize: 14 }} />
              )}
            </ListItemButton>
          );
          return (
            <Box key={item.path} sx={{ mb: 0.25 }}>
              {collapsed ? (
                <Tooltip title={item.label} placement="right" arrow>
                  {button}
                </Tooltip>
              ) : (
                button
              )}
            </Box>
          );
        })}
      </List>
    </Box>
  );
}

function SidebarContent({ collapsed, activePath, onNavigate, showCollapseToggle, onToggleCollapsed }) {
  return (
    <Box sx={{ pt: 2, flexGrow: 1 }}>
      {showCollapseToggle && (
        <Stack direction="row" alignItems="center" justifyContent={collapsed ? 'center' : 'flex-end'} sx={{ px: collapsed ? 0 : 1.5, mb: 0.5 }}>
          <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <IconButton size="small" onClick={onToggleCollapsed}>
              {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Stack>
      )}
      {NAV_GROUPS.map((group, i) => (
        <NavGroup key={group.label} group={group} collapsed={collapsed} activePath={activePath} onNavigate={onNavigate} isFirst={i === 0} />
      ))}
    </Box>
  );
}

/**
 * Two `<Drawer>`s sharing the same grouped nav content: a mobile full-width overlay (opened via
 * the header hamburger, closed on nav/backdrop) and a desktop permanent drawer that collapses to
 * an icon-only rail in place rather than disappearing. `collapsed`/`mobileOpen` are owned by
 * MainLayout (both Header and Sidebar need to read/drive them), passed down as props.
 */
export default function Sidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile, activePath, onNavigate }) {
  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onCloseMobile}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <SidebarContent collapsed={false} activePath={activePath} onNavigate={onNavigate} showCollapseToggle={false} />
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          transition: (theme) => theme.transitions.create('width', { duration: theme.transitions.duration.shorter }),
          [`& .MuiDrawer-paper`]: {
            width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
            boxSizing: 'border-box',
            overflowX: 'hidden',
            transition: (theme) => theme.transitions.create('width', { duration: theme.transitions.duration.shorter }),
          },
        }}
      >
        <Toolbar />
        <SidebarContent
          collapsed={collapsed}
          activePath={activePath}
          onNavigate={onNavigate}
          showCollapseToggle
          onToggleCollapsed={onToggleCollapsed}
        />
      </Drawer>
    </>
  );
}
